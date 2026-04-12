from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from .config import settings
from typing import Optional

_MODEL = None
_TOKENIZER = None


def _load_model():
    global _MODEL, _TOKENIZER
    if _MODEL is not None and _TOKENIZER is not None:
        return _MODEL, _TOKENIZER

    model_name = settings.FLAN_MODEL_NAME
    use_cuda = settings.FLAN_USE_CUDA and torch.cuda.is_available()

    tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)

    # Try to load in an efficient way if CUDA is available
    try:
        if use_cuda:
            model = AutoModelForSeq2SeqLM.from_pretrained(
                model_name,
                device_map="auto",
                torch_dtype=torch.float16,
                low_cpu_mem_usage=True,
            )
        else:
            model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    except Exception:
        # Fallback to a safer CPU load
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

    # If device_map wasn't used, move to device
    if not use_cuda:
        device = torch.device("cpu")
        model = model.to(device)

    _MODEL = model
    _TOKENIZER = tokenizer
    return _MODEL, _TOKENIZER


def generate_recipe(
    prompt: str,
    max_length: Optional[int] = None,
    context_docs: Optional[list] = None,
    enforce_json: bool = False,
    max_retries: int = 2,
) -> str | tuple:
    """Generate a recipe text using Flan-T5. Optionally include retrieval `context_docs` (list of short strings).
    If `enforce_json` is True, attempt to parse and repair JSON output up to `max_retries` times.
    Returns generated string (or (text, parsed_dict) when enforce_json=True).
    """
    model, tokenizer = _load_model()
    device = next(model.parameters()).device

    gen_kwargs = {
        "max_new_tokens": max_length or settings.FLAN_MAX_TOKENS,
        "temperature": float(settings.FLAN_TEMPERATURE),
        "do_sample": True,
        "top_p": 0.95,
        "num_return_sequences": 1,
        "pad_token_id": tokenizer.pad_token_id or tokenizer.eos_token_id,
    }

    # include retrieval context if provided
    if context_docs:
        context_text = "\n\nContext recipes:\n" + "\n---\n".join(context_docs[:5])
        prompt = context_text + "\n\n" + prompt

    # tokenize with padding/truncation and move to the model device
    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=settings.FLAN_MAX_TOKENS,
    )

    # move tensors to model device if possible
    try:
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
    except Exception:
        pass

    with torch.no_grad():
        output_ids = model.generate(**inputs, **gen_kwargs)

    text = tokenizer.decode(output_ids[0], skip_special_tokens=True)

    if not enforce_json:
        return text

    # Enforce JSON: try parse, otherwise attempt simple repair by re-prompting
    import json

    def try_parse(s: str):
        try:
            return json.loads(s)
        except Exception:
            return None

    parsed = try_parse(text)
    if parsed is not None:
        return text, parsed

    # attempt to extract a JSON substring
    import re

    match = re.search(r"\{(?:[^{}]|(?R))*\}", text)
    if match:
        parsed = try_parse(match.group(0))
        if parsed is not None:
            return match.group(0), parsed

    # retries: ask model to return valid JSON only
    for attempt in range(max_retries):
        repair_prompt = (
            "The previous output was not valid JSON.\n"
            "Previous output:\n" + text + "\n\n"
            "Please output ONLY a single valid JSON object matching the schema provided earlier."
        )
        # feed the repair prompt as new input
        inputs = tokenizer(repair_prompt, return_tensors="pt", truncation=True).to(device)
        with torch.no_grad():
            out_ids = model.generate(**inputs, **gen_kwargs)
        repaired = tokenizer.decode(out_ids[0], skip_special_tokens=True)
        parsed = try_parse(repaired)
        if parsed is not None:
            return repaired, parsed
        # try extracting JSON substring
        m = re.search(r"\{(?:[^{}]|(?R))*\}", repaired)
        if m:
            parsed = try_parse(m.group(0))
            if parsed is not None:
                return m.group(0), parsed
        # set text to repaired for next iteration context
        text = repaired

    # failed to produce valid JSON
    return text, None
