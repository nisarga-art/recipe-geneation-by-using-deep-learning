import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/NutrientDetail.css";
import ProfileDropdown from "../components/ProfileDropdown";

const NUTRIENTS = {
  "vitamin-c": {
    emoji: "🍊", color: "#ff6a00",
    name: "Vitamin C (Ascorbic Acid)",
    desc: "Vitamin C is a powerful antioxidant that plays a crucial role in immune function, collagen synthesis, and iron absorption. It helps protect cells from damage caused by free radicals, supports wound healing, and is essential for the growth and repair of all tissues throughout the body. Since the body cannot synthesize or store Vitamin C, a consistent daily intake from food is essential.",
    dailyReq: "Adults: 65-90mg per day (upper limit 2000mg). Smokers need an additional 35mg. Pregnant women: 85mg, breastfeeding: 120mg per day.",
    benefits: [
      "Boosts immune system and fights off infections",
      "Powerful antioxidant that neutralizes harmful free radicals",
      "Essential for collagen production and wound healing",
      "Significantly enhances iron absorption from plant-based foods",
      "Reduces risk of chronic diseases including heart disease",
      "Supports cardiovascular health by lowering blood pressure",
      "Promotes healthy, glowing skin and slows skin aging",
      "May reduce duration and severity of the common cold"
    ],
    sources: [
      { name: "Guava", serving: "per 100g", amount: "228mg" },
      { name: "Bell Peppers (red)", serving: "per 100g", amount: "128mg" },
      { name: "Kiwi", serving: "per 100g", amount: "93mg" },
      { name: "Broccoli", serving: "per 100g", amount: "89mg" },
      { name: "Strawberries", serving: "per 100g", amount: "59mg" },
      { name: "Oranges", serving: "per 100g", amount: "53mg" },
      { name: "Papaya", serving: "per 100g", amount: "62mg" },
      { name: "Brussels Sprouts", serving: "per 100g", amount: "85mg" },
    ],
    deficiency: [
      "Scurvy — bleeding gums, skin spots, and loose teeth",
      "Persistent fatigue and general weakness",
      "Weakened immune system and frequent illness",
      "Slow wound healing and easy bruising",
      "Dry, rough, and bumpy skin",
      "Joint swelling, muscle pain, and aching bones"
    ],
    tips: [
      "Eat raw fruits and vegetables — cooking destroys up to 50% of Vitamin C",
      "Pair Vitamin C–rich foods with iron-rich plant foods to boost absorption",
      "Refrigerate produce and consume within a few days to preserve Vitamin C",
      "A single red bell pepper provides more than double the daily requirement"
    ],
    facts: [
      "Humans are one of the few mammals that cannot synthesize their own Vitamin C — we must get it entirely from food.",
      "Vitamin C boosts iron absorption from plant sources (non-heme iron) by up to 300% when eaten together.",
      "During high physical stress or illness, the body's Vitamin C needs increase significantly — up to 200mg/day.",
      "Vitamin C acts as a natural antihistamine and may help reduce allergy symptoms."
    ],
    interactions: [
      { nutrient: "Iron", type: "enhances", desc: "Vitamin C dramatically increases the absorption of non-heme iron from plant foods. Eat them together for maximum benefit." },
      { nutrient: "Vitamin E", type: "enhances", desc: "Vitamin C can regenerate oxidized Vitamin E back to its active form, boosting the antioxidant power of both vitamins." },
      { nutrient: "Calcium", type: "neutral", desc: "High doses of Vitamin C supplements may slightly increase calcium excretion via urine — keep supplement doses moderate." }
    ]
  },
  "protein": {
    emoji: "🥩", color: "#ef4444",
    name: "Protein",
    desc: "Protein is an essential macronutrient made up of amino acids — the building blocks of life. It's crucial for building and repairing tissues, making enzymes and hormones, supporting immune function, transporting nutrients, and providing structural components to every cell in the body. Of the 20 amino acids, 9 are 'essential' meaning the body cannot make them and must obtain them from food.",
    dailyReq: "Adults: 0.8g per kg of body weight (46-56g per day). Athletes and active individuals may need 1.2-2.0g per kg. Pregnant women need an additional 25g per day. Older adults benefit from 1.0-1.2g per kg.",
    benefits: [
      "Builds, maintains, and repairs all muscles and body tissues",
      "Produces enzymes that drive every biochemical reaction in the body",
      "Manufactures hormones including insulin, growth hormone, and thyroid hormones",
      "Creates antibodies that defend the body against pathogens",
      "Provides long-lasting satiety and reduces overall calorie intake",
      "Helps maintain healthy bone density and reduces fracture risk",
      "Supports healthy metabolism and preserves lean muscle mass during weight loss",
      "Essential for growth, development, and recovery from illness or injury"
    ],
    sources: [
      { name: "Chicken Breast", serving: "per 100g", amount: "31g" },
      { name: "Tuna (canned)", serving: "per 100g", amount: "25g" },
      { name: "Beef (lean)", serving: "per 100g", amount: "26g" },
      { name: "Greek Yogurt", serving: "per 100g", amount: "17g" },
      { name: "Cottage Cheese", serving: "per 100g", amount: "11g" },
      { name: "Eggs", serving: "per 100g", amount: "13g" },
      { name: "Lentils", serving: "per 100g (cooked)", amount: "9g" },
      { name: "Tofu", serving: "per 100g", amount: "8g" },
    ],
    deficiency: [
      "Muscle wasting (sarcopenia) and loss of strength",
      "Compromised immune function and frequent infections",
      "Persistent fatigue and slow recovery from exercise",
      "Poor wound healing and slow tissue repair",
      "Edema — fluid retention and puffiness, especially in the legs",
      "Brittle nails, thinning hair, and dry skin"
    ],
    tips: [
      "Include a complete protein source in every meal for consistent amino acid availability",
      "Combine plant proteins strategically: beans + rice, hummus + pita, lentils + grains",
      "Consume 20-40g of protein within 30-60 minutes after exercise for optimal muscle recovery",
      "Spread intake across meals — the body can only optimally use ~25-40g of protein at once"
    ],
    facts: [
      "Your hair and nails are almost entirely made of keratin — a structural protein. Protein deficiency shows up first as brittle nails and hair loss.",
      "The body does not store excess protein like it does fat or carbohydrates — you need a daily supply through your diet.",
      "Egg protein has the highest biological value (BV) of any whole food, meaning the body uses nearly all the amino acids it provides.",
      "Plant-based athletes can meet all protein needs through a varied diet of legumes, grains, nuts, seeds, and soy."
    ],
    interactions: [
      { nutrient: "Vitamin C", type: "enhances", desc: "Vitamin C is essential for collagen synthesis — a structural protein. Adequate Vitamin C ensures the protein you eat is properly used for tissue building." },
      { nutrient: "Calcium", type: "neutral", desc: "Very high protein intake (>2.5g/kg/day) may increase calcium loss in urine. Ensure adequate calcium intake if consuming very high protein diets." },
      { nutrient: "Iron", type: "enhances", desc: "Heme iron in animal proteins absorbs far more readily than plant iron, and animal protein also enhances absorption of non-heme iron when eaten together." }
    ]
  },
  "carbohydrates": {
    emoji: "🌾", color: "#f97316",
    name: "Carbohydrates",
    desc: "Carbohydrates are the body's primary and most efficient energy source. They're broken down into glucose, which fuels your brain, muscles, and every bodily function. Complex carbohydrates from whole foods provide not only sustained energy but also dietary fiber, B vitamins, and important minerals. Not all carbs are equal — whole food carbs are nutritionally far superior to refined sugars and processed grains.",
    dailyReq: "Adults: 225-325g per day (45-65% of total calories). Focus on complex carbohydrates from whole grains and vegetables. Limit added sugars to less than 25g per day for women and 36g for men.",
    benefits: [
      "Primary and most efficient fuel source for brain and central nervous system",
      "Glycogen stored in muscles provides quick energy during exercise",
      "Dietary fiber in complex carbs supports digestive health",
      "B vitamins in whole grains drive energy metabolism in every cell",
      "Regulates mood — low carb intake linked to irritability and brain fog",
      "Fiber helps lower LDL cholesterol and regulate blood sugar",
      "Provides prebiotics to feed beneficial gut bacteria",
      "Spares protein from being used as an energy source"
    ],
    sources: [
      { name: "Oats", serving: "per 100g (dry)", amount: "66g" },
      { name: "Banana", serving: "per medium", amount: "27g" },
      { name: "Brown Rice", serving: "per 100g (cooked)", amount: "23g" },
      { name: "Quinoa", serving: "per 100g (cooked)", amount: "21g" },
      { name: "Sweet Potato", serving: "per 100g", amount: "20g" },
      { name: "Whole Wheat Bread", serving: "per slice", amount: "15g" },
      { name: "Chickpeas (cooked)", serving: "per 100g", amount: "27g" },
      { name: "Lentils (cooked)", serving: "per 100g", amount: "20g" },
    ],
    deficiency: [
      "Persistent fatigue and very low energy levels",
      "Brain fog, poor concentration, and memory issues",
      "Irritability, anxiety, and mood swings",
      "Muscle breakdown — body catabolizes protein for energy",
      "Nutritional ketosis from excessive fat oxidation",
      "Reduced athletic performance and endurance"
    ],
    tips: [
      "Choose complex carbs — whole grains, legumes, and vegetables — over refined sugars",
      "Pair carbs with protein and healthy fats to slow glucose absorption and avoid spikes",
      "Time higher carbohydrate intake around workouts for optimal energy and recovery",
      "Read labels: aim for products with fiber listed as the first or second ingredient"
    ],
    facts: [
      "The brain alone consumes about 120g of glucose per day — and strongly prefers carbohydrates as its primary fuel source.",
      "1g of glycogen (stored carbohydrate) holds about 3g of water, which is why low-carb diets cause rapid initial water weight loss.",
      "Resistant starches (cooked and cooled potatoes, rice) act like fiber — they feed gut bacteria and don't spike blood sugar.",
      "Refined sugar provides 'empty calories' — no vitamins, minerals, or fiber — unlike unprocessed carbohydrate sources."
    ],
    interactions: [
      { nutrient: "Dietary Fiber", type: "enhances", desc: "Fiber slows carbohydrate digestion, preventing blood sugar spikes. High-fiber carb sources provide steady, sustained energy rather than quick highs and crashes." },
      { nutrient: "Protein", type: "enhances", desc: "Combining carbs with protein at meals creates an ideal anabolic environment post-workout, maximizing muscle protein synthesis and glycogen replenishment." },
      { nutrient: "Vitamin B1 (Thiamine)", type: "enhances", desc: "The body requires B vitamins (especially thiamine, riboflavin, niacin) to metabolize carbohydrates into usable energy efficiently." }
    ]
  },
  "healthy-fats": {
    emoji: "🫒", color: "#eab308",
    name: "Healthy Fats",
    desc: "Dietary fats are essential for hormone production, nutrient absorption, and cell membrane health. Healthy fats, particularly omega-3 fatty acids, support heart health, brain function, and reduce inflammation. Despite decades of fat-phobia, research now confirms that the type of fat matters far more than the total amount — unsaturated fats are protective, while trans fats and excess saturated fats increase disease risk.",
    dailyReq: "Adults: 44-78g per day (20-35% of total calories). Focus on unsaturated fats and omega-3s. Limit saturated fats to less than 10% of calories. Eliminate trans fats entirely.",
    benefits: [
      "Supports brain health and cognitive function — brain is 60% fat",
      "Aids in absorption of fat-soluble vitamins (A, D, E, K)",
      "Provides long-lasting, sustained energy without blood sugar spikes",
      "Promotes healthy, supple skin, hair, and nails",
      "Regulates hormone production including sex hormones and cortisol",
      "Reduces systemic inflammation — especially omega-3 fats",
      "Supports heart health by improving cholesterol ratios (unsaturated fats)",
      "Protects internal organs through adipose tissue cushioning"
    ],
    sources: [
      { name: "Avocado", serving: "per 1 medium", amount: "21g" },
      { name: "Salmon", serving: "per 100g", amount: "13g" },
      { name: "Olive Oil", serving: "per 1 tablespoon", amount: "14g" },
      { name: "Almonds", serving: "per 1 ounce", amount: "14g" },
      { name: "Walnuts", serving: "per 1 ounce", amount: "18g" },
      { name: "Chia Seeds", serving: "per 1 ounce", amount: "9g" },
      { name: "Dark Chocolate (70%+)", serving: "per 1 ounce", amount: "12g" },
      { name: "Flaxseeds", serving: "per 3 tablespoons", amount: "12g" },
    ],
    deficiency: [
      "Dry, scaly skin and persistent eczema",
      "Hair loss, brittleness, and dull complexion",
      "Poor wound healing and easy bruising",
      "Difficulty concentrating and poor memory",
      "Hormonal imbalances and irregular cycles",
      "Deficiency in fat-soluble vitamins (A, D, E, K)",
      "Joint pain, stiffness, and increased inflammation"
    ],
    tips: [
      "Replace saturated fats with unsaturated fats — use olive oil instead of butter",
      "Include omega-3 rich foods like fatty fish (salmon, mackerel) 2-3 times per week",
      "Snack on a small handful of mixed nuts to easily meet daily healthy fat needs",
      "Avoid all trans fats found in processed foods, margarine, and commercially fried items"
    ],
    facts: [
      "The human brain is approximately 60% fat by dry weight — making dietary fat intake critical for cognitive health at every life stage.",
      "Fat-soluble vitamins A, D, E, and K cannot be absorbed without fat present in the same meal — always pair them with healthy fats.",
      "Olive oil's primary fat (oleic acid, an omega-9) has been shown to reduce LDL cholesterol and inflammatory markers in over 50 clinical studies.",
      "Avocados are one of the rare fruits with significant fat content — and their fat profile is almost identical to olive oil."
    ],
    interactions: [
      { nutrient: "Vitamin D", type: "enhances", desc: "Vitamin D is fat-soluble and requires dietary fat for absorption. Taking Vitamin D supplements or eating Vitamin D foods with healthy fats significantly improves uptake." },
      { nutrient: "Omega-3 Fatty Acids", type: "enhances", desc: "Omega-3 and omega-6 fats must be balanced (ideally 1:4 ratio). Modern diets are omega-6 heavy. Prioritizing omega-3 sources reduces inflammation caused by excess omega-6." },
      { nutrient: "Vitamin E", type: "enhances", desc: "Vitamin E is fat-soluble and is found naturally alongside healthy fats in nuts and seeds. It protects polyunsaturated fats from oxidation inside the body." }
    ]
  },
  "dietary-fiber": {
    emoji: "🥦", color: "#22c55e",
    name: "Dietary Fiber",
    desc: "Fiber is a type of carbohydrate that the body cannot fully digest, yet it plays an indispensable role in health. It's essential for digestive health, regulating blood sugar, lowering cholesterol, maintaining healthy weight, and supporting a diverse gut microbiome. There are two main types: soluble fiber (dissolves in water, forms a gel, lowers cholesterol) and insoluble fiber (adds bulk, speeds transit, prevents constipation).",
    dailyReq: "Adults: 25g per day for women, 38g per day for men (age 50 and under). After 50, women need 21g and men 30g per day. Most people only consume about 15g daily — far below the recommendation.",
    benefits: [
      "Promotes regular bowel movements and prevents constipation",
      "Lowers LDL (bad) cholesterol through bile acid binding (soluble fiber)",
      "Regulates blood sugar by slowing glucose absorption after meals",
      "Promotes healthy body weight through long-lasting fullness",
      "Feeds beneficial gut bacteria (acts as a prebiotic)",
      "Significantly reduces risk of colorectal cancer",
      "Reduces risk of type 2 diabetes and metabolic syndrome",
      "Supports a healthy, diverse gut microbiome"
    ],
    sources: [
      { name: "Black Beans", serving: "per 100g (cooked)", amount: "15g" },
      { name: "Chia Seeds", serving: "per 1 ounce", amount: "10g" },
      { name: "Avocado", serving: "per 1 medium", amount: "10g" },
      { name: "Oats", serving: "per 100g (dry)", amount: "10g" },
      { name: "Lentils", serving: "per 100g (cooked)", amount: "8g" },
      { name: "Pears", serving: "per medium fruit", amount: "5.5g" },
      { name: "Almonds", serving: "per 1 ounce", amount: "3.5g" },
      { name: "Broccoli", serving: "per 100g", amount: "2.6g" },
    ],
    deficiency: [
      "Chronic constipation and irregular bowel movements",
      "Elevated LDL cholesterol and cardiovascular risk",
      "Rapid blood sugar spikes after meals",
      "Increased hunger, overeating, and weight gain",
      "Poor gut microbiome diversity and digestive complaints",
      "Higher long-term risk of colon cancer and digestive diseases"
    ],
    tips: [
      "Increase fiber intake very gradually (by 5g/week) to avoid bloating and gas",
      "Drink at least 8 glasses of water daily — fiber needs water to move through the digestive tract",
      "Always choose whole grain versions of bread, pasta, and rice over white/refined versions",
      "Eat fruits with their skin on (apples, pears) — the skin often contains more fiber than the flesh"
    ],
    facts: [
      "Soluble fiber in oats (beta-glucan) is so effective at lowering cholesterol that the FDA allows oat products to carry a heart health claim.",
      "Your gut microbiome contains trillions of bacteria that ferment fiber into short-chain fatty acids (SCFAs), which protect the colon lining and reduce inflammation.",
      "High-fiber diets are associated with a 15-30% lower risk of all-cause mortality, heart disease, stroke, and type 2 diabetes.",
      "Psyllium husk is one of the most fiber-concentrated supplements available — just 7g provides the equivalent fiber of a full serving of vegetables."
    ],
    interactions: [
      { nutrient: "Calcium", type: "inhibits", desc: "Very high fiber intake (especially from grains with phytates) can slightly reduce calcium absorption. Balance fiber sources and don't rely entirely on wheat bran." },
      { nutrient: "Iron", type: "inhibits", desc: "Phytic acid found in high-fiber plant foods can bind to non-heme iron and reduce its absorption. Vitamin C consumed at the same meal counteracts this effect." },
      { nutrient: "Carbohydrates", type: "enhances", desc: "Fiber slows the digestion of all carbohydrates eaten at the same meal, preventing blood sugar spikes and providing more sustained energy throughout the day." }
    ]
  },
  "vitamin-d": {
    emoji: "☀️", color: "#f59e0b",
    name: "Vitamin D",
    desc: "Vitamin D is a fat-soluble vitamin that's crucial for bone health, calcium and phosphorus absorption, immune function, and mood regulation. Unlike any other vitamin, your body can synthesize Vitamin D when skin is exposed to UVB sunlight — making it technically a hormone as much as a vitamin. Modern indoor lifestyles have made Vitamin D deficiency one of the most widespread nutritional deficiencies worldwide.",
    dailyReq: "Adults 18-70: 600 IU (15 mcg) per day. Adults 70+: 800 IU (20 mcg) per day. Upper safe limit: 4000 IU per day. Blood test target: 30-60 ng/mL serum 25(OH)D for optimal health.",
    benefits: [
      "Maintains strong and healthy bones by enabling calcium absorption",
      "Regulates calcium and phosphorus metabolism throughout the body",
      "Modulates immune system — reduces risk of autoimmune diseases",
      "Regulates mood and significantly reduces risk of seasonal depression",
      "Required for muscle function and strength — especially in older adults",
      "Reduces risk of certain cancers including colon, breast, and prostate",
      "Supports cardiovascular health and blood pressure regulation",
      "Essential for proper fetal development during pregnancy"
    ],
    sources: [
      { name: "Cod Liver Oil", serving: "per tablespoon", amount: "1360 IU" },
      { name: "Salmon (cooked)", serving: "per 100g", amount: "447 IU" },
      { name: "Swordfish", serving: "per 100g", amount: "558 IU" },
      { name: "Mackerel", serving: "per 100g", amount: "360 IU" },
      { name: "Fortified Milk", serving: "per cup", amount: "120 IU" },
      { name: "Fortified OJ", serving: "per cup", amount: "100 IU" },
      { name: "Egg Yolks", serving: "per yolk", amount: "37 IU" },
      { name: "UV Mushrooms", serving: "per 100g", amount: "up to 400 IU" },
    ],
    deficiency: [
      "Rickets in children — soft, deformed, weak bones",
      "Osteomalacia and osteoporosis in adults",
      "Muscle weakness, cramping, and pain",
      "Seasonal affective disorder (SAD) and depression",
      "Frequent infections and immune dysfunction",
      "Fatigue, bone pain, and general malaise"
    ],
    tips: [
      "Get 15-30 minutes of midday sunlight on your arms and legs — this can generate 10,000+ IU",
      "Eat fatty fish (salmon, mackerel, sardines) at least twice per week to boost dietary Vitamin D",
      "Choose fortified dairy products, plant milks, and breakfast cereals for additional intake",
      "Consider a vitamin D3 supplement (1000-2000 IU/day) if you live at northern latitudes or work indoors"
    ],
    facts: [
      "Over 1 billion people worldwide are estimated to be Vitamin D deficient — making it the most common nutrient deficiency globally.",
      "Dark skin contains more melanin, which blocks UVB rays and reduces Vitamin D synthesis — people with darker skin need more sun exposure.",
      "Vitamin D3 (cholecalciferol, from animals and sunlight) raises blood levels about 87% more effectively than Vitamin D2 (from plants).",
      "Vitamin D receptors are found in nearly every cell in the human body — suggesting it plays far more roles than bone health alone."
    ],
    interactions: [
      { nutrient: "Calcium", type: "enhances", desc: "Vitamin D is essential for calcium absorption in the intestines. Without sufficient Vitamin D, calcium absorption can drop from ~40% to below 15% — making it nearly impossible to maintain bone density." },
      { nutrient: "Healthy Fats", type: "enhances", desc: "Vitamin D is fat-soluble. Consuming Vitamin D foods or supplements with a fat-containing meal significantly increases its absorption and bioavailability." },
      { nutrient: "Magnesium", type: "enhances", desc: "Magnesium is needed to activate Vitamin D in the body. Without adequate magnesium, Vitamin D remains inert even if blood levels seem sufficient." }
    ]
  },
  "iron": {
    emoji: "⚡", color: "#ef4444",
    name: "Iron",
    desc: "Iron is an essential trace mineral that's crucial for producing hemoglobin — the protein in red blood cells that transports oxygen throughout the body. It also forms myoglobin in muscles, drives energy production in mitochondria, and supports cognitive development. There are two dietary types: heme iron (from animal products, 15-35% absorption) and non-heme iron (from plants, 2-20% absorption) — with significant differences in bioavailability.",
    dailyReq: "Adult men: 8mg per day. Adult women 19-50: 18mg per day (higher due to menstrual losses). Pregnant women: 27mg per day. Vegetarians may need 1.8x more due to lower non-heme iron absorption.",
    benefits: [
      "Essential for hemoglobin production and oxygen transport to all cells",
      "Supports energy production at the mitochondrial level in every cell",
      "Critical for healthy immune system function and response",
      "Supports brain development, cognitive function, and attention",
      "Required for myoglobin in muscles — stores and releases oxygen during exercise",
      "Regulates body temperature and supports thyroid hormone metabolism",
      "Supports healthy pregnancy and proper fetal brain development",
      "Required for over 200 enzymatic reactions in the body"
    ],
    sources: [
      { name: "Pumpkin Seeds", serving: "per 100g", amount: "8.8mg" },
      { name: "Dark Chocolate (85%)", serving: "per 100g", amount: "7.9mg" },
      { name: "Lentils (cooked)", serving: "per 100g", amount: "3.3mg" },
      { name: "Tofu", serving: "per 100g", amount: "3.4mg" },
      { name: "Spinach (cooked)", serving: "per 100g", amount: "2.7mg" },
      { name: "Red Meat (beef)", serving: "per 100g", amount: "2.2mg" },
      { name: "Tempeh", serving: "per 100g", amount: "2.7mg" },
      { name: "Kidney Beans", serving: "per 100g (cooked)", amount: "2.2mg" },
    ],
    deficiency: [
      "Iron deficiency anemia — the most common nutritional deficiency worldwide",
      "Extreme fatigue, weakness, and low energy affecting daily function",
      "Pale skin, pale gums, and pale inner eyelids",
      "Shortness of breath and rapid heartbeat during mild activity",
      "Cold hands and feet from poor circulation",
      "Brittle nails (koilonychia — spoon-shaped nails in severe cases)"
    ],
    tips: [
      "Always pair plant-based iron with Vitamin C — it can increase non-heme iron absorption by up to 300%",
      "Avoid drinking coffee, tea, or calcium-rich foods within 1 hour of iron-rich meals",
      "Cook acidic foods in cast iron cookware — iron leaches into food and provides a dietary boost",
      "Soaking, sprouting, or fermenting legumes reduces phytic acid and significantly improves iron absorption"
    ],
    facts: [
      "Iron deficiency anemia affects over 1.2 billion people worldwide — the most prevalent micronutrient deficiency on earth.",
      "Women of childbearing age need more than double the iron of adult men due to monthly blood losses.",
      "The body recycles most iron from old red blood cells — you lose relatively little iron daily, making intake needs modest for most adults.",
      "Heme iron from meat absorbs at 15-35%, while non-heme iron from plants absorbs at only 2-20% — illustrating the importance of dietary strategy for vegetarians."
    ],
    interactions: [
      { nutrient: "Vitamin C", type: "enhances", desc: "Vitamin C is the single most powerful enhancer of non-heme iron absorption. A glass of orange juice or bell pepper with your lentils can triple iron absorption." },
      { nutrient: "Calcium", type: "inhibits", desc: "Calcium directly competes with iron for absorption in the intestine. Avoid taking calcium supplements or drinking milk at the same time as iron-rich meals." },
      { nutrient: "Vitamin A", type: "enhances", desc: "Vitamin A helps mobilize stored iron from the liver and supports the formation of red blood cells, working synergistically with dietary iron to prevent anemia." }
    ]
  },
  "calcium": {
    emoji: "🦴", color: "#3b82f6",
    name: "Calcium",
    desc: "Calcium is the most abundant mineral in the human body — with 99% stored in bones and teeth as the structural mineral hydroxyapatite. The remaining 1% circulates in blood and tissues, where it plays critical roles in muscle contraction, nerve signal transmission, enzyme regulation, blood clotting, and heart rhythm. The body tightly regulates blood calcium, and will draw from bone stores if dietary calcium is insufficient.",
    dailyReq: "Adults 19-50: 1000mg per day. Women 51-70 and all adults 70+: 1200mg per day. Teenagers: 1300mg per day. Upper limit: 2500mg per day. Requires adequate Vitamin D for optimal absorption.",
    benefits: [
      "Builds peak bone mass in youth and maintains density throughout life",
      "Prevents osteoporosis and dramatically reduces fracture risk in aging",
      "Essential for every muscle contraction — including the heartbeat",
      "Required for nerve impulse transmission throughout the nervous system",
      "Activates enzymes involved in digestion and energy metabolism",
      "Critical for normal blood clotting cascade",
      "Helps regulate blood pressure — may prevent hypertension",
      "Supports healthy muscle function and prevents cramps"
    ],
    sources: [
      { name: "Parmesan Cheese", serving: "per 1 ounce", amount: "336mg" },
      { name: "Yogurt (plain)", serving: "per cup", amount: "415mg" },
      { name: "Sardines (with bones)", serving: "per 100g", amount: "325mg" },
      { name: "Fortified Plant Milk", serving: "per cup", amount: "300-450mg" },
      { name: "Milk (whole)", serving: "per cup", amount: "300mg" },
      { name: "Almonds", serving: "per 100g", amount: "264mg" },
      { name: "Kale (cooked)", serving: "per 100g", amount: "177mg" },
      { name: "Chia Seeds", serving: "per 1 ounce", amount: "179mg" },
    ],
    deficiency: [
      "Osteoporosis — silent loss of bone density over decades",
      "Hypocalcemia — muscle cramps, spasms, and tetany",
      "Numbness and tingling in fingers, toes, and around the mouth",
      "Dental problems — weak enamel and increased cavities",
      "Irregular heartbeat and cardiovascular complications",
      "Increased risk of stress fractures, especially in athletes"
    ],
    tips: [
      "Always pair calcium-rich foods or supplements with Vitamin D for optimal absorption",
      "Don't take more than 500mg calcium at once — spread smaller doses throughout the day for better absorption",
      "Reduce excess sodium and caffeine — both increase urinary calcium loss",
      "Include weight-bearing exercise (walking, running, strength training) to maximize bone formation"
    ],
    facts: [
      "The human skeleton serves as a calcium 'bank' — if dietary intake is insufficient, the body withdraws calcium from bones to maintain blood levels. Over decades, this causes osteoporosis.",
      "Calcium absorption is highest during childhood and adolescence — peak bone mass is set by age 25, making early adequate intake crucial.",
      "Calcium from food absorbs far more effectively than from supplements — whole dairy foods provide co-factors (casein, lactose) that enhance uptake.",
      "Contrary to popular belief, spinach is a poor calcium source despite its high calcium content — because oxalic acid binds calcium and prevents its absorption."
    ],
    interactions: [
      { nutrient: "Vitamin D", type: "enhances", desc: "Vitamin D is absolutely essential for intestinal calcium absorption. Without adequate Vitamin D, the body absorbs as little as 10-15% of dietary calcium. Always ensure both are sufficient." },
      { nutrient: "Iron", type: "inhibits", desc: "Calcium competes with iron for the same intestinal absorption transporter. Avoid taking calcium and iron-rich foods or supplements at the same meal." },
      { nutrient: "Magnesium", type: "enhances", desc: "Calcium and magnesium work together in muscle function — calcium triggers contraction, magnesium enables relaxation. Imbalanced ratios can lead to muscle cramps and tension." }
    ]
  },
  "omega-3": {
    emoji: "💙", color: "#6366f1",
    name: "Omega-3 Fatty Acids",
    desc: "Omega-3 fatty acids are essential polyunsaturated fats that the body cannot synthesize and must obtain from food. They're foundational to brain structure, heart function, vision, and the regulation of inflammation throughout the body. There are three main types: ALA (alpha-linolenic acid, found in plants), and EPA and DHA (found in fatty fish and algae) — EPA and DHA are the most biologically active and health-relevant forms.",
    dailyReq: "Adults: 1.1-1.6g ALA per day as minimum. For meaningful cardiovascular and brain benefits: 250-500mg combined EPA+DHA daily. Pregnant and breastfeeding women: at least 200mg DHA per day for fetal brain development.",
    benefits: [
      "Reduces triglycerides and lowers cardiovascular disease risk",
      "Supports brain structure, memory, and cognitive performance",
      "DHA is critical for fetal brain and eye development during pregnancy",
      "Powerfully reduces systemic inflammation throughout the body",
      "Maintains retinal function and visual acuity (DHA in retina)",
      "May significantly reduce depression and anxiety symptoms",
      "Reduces joint pain and morning stiffness in arthritis",
      "Supports healthy skin hydration, elasticity, and barrier function"
    ],
    sources: [
      { name: "Flaxseeds (ground)", serving: "per tablespoon", amount: "2.4g ALA" },
      { name: "Chia Seeds", serving: "per 1 ounce", amount: "5g ALA" },
      { name: "Mackerel", serving: "per 100g", amount: "2.6g EPA+DHA" },
      { name: "Walnuts", serving: "per 1 ounce", amount: "2.5g ALA" },
      { name: "Salmon (Atlantic)", serving: "per 100g", amount: "2.2g EPA+DHA" },
      { name: "Sardines (canned)", serving: "per 100g", amount: "1.5g EPA+DHA" },
      { name: "Hemp Seeds", serving: "per 3 tablespoons", amount: "2.6g ALA" },
      { name: "Algae Oil", serving: "per serving", amount: "400-500mg DHA" },
    ],
    deficiency: [
      "Dry, flaky skin with poor moisture retention",
      "Brain fog, poor concentration, and memory decline",
      "Depression, anxiety, and unstable mood",
      "Joint pain, stiffness, and increased inflammatory conditions",
      "Dry, irritated eyes and declining visual acuity",
      "Increased risk of cardiovascular disease and inflammation"
    ],
    tips: [
      "Eat fatty fish (salmon, mackerel, herring, sardines) at least 2 times per week",
      "Add ground flaxseed or chia seeds to smoothies, oatmeal, or yogurt for an ALA boost",
      "Choose algae-based DHA supplements if vegan or vegetarian — algae is where fish get their omega-3s",
      "Store omega-3 rich oils (flaxseed, hemp) in the refrigerator — they oxidize quickly at room temperature"
    ],
    facts: [
      "DHA (docosahexaenoic acid) constitutes up to 40% of the polyunsaturated fatty acids in the brain and 60% in the retina — making it literally structural to human consciousness and vision.",
      "The human body can convert plant-based ALA to EPA and DHA, but this conversion is extremely inefficient — only about 5-10% of ALA becomes EPA, and less than 0.5% becomes DHA.",
      "High-dose fish oil (4g EPA+DHA/day) is an FDA-approved treatment for very high triglycerides, demonstrating the cardiovascular power of omega-3s.",
      "Traditional societies with high fish intake (Japanese, Inuit) have some of the lowest rates of heart disease and dementia in the world — with omega-3 consumption cited as a key factor."
    ],
    interactions: [
      { nutrient: "Vitamin E", type: "enhances", desc: "Vitamin E acts as an antioxidant that protects polyunsaturated omega-3 fats from oxidation in the body. Adequate Vitamin E helps omega-3s remain functional and bioavailable." },
      { nutrient: "Healthy Fats", type: "enhances", desc: "Omega-3s are fat-soluble and absorb best when consumed with other dietary fats. A meal containing healthy fats significantly increases omega-3 bioavailability." },
      { nutrient: "Omega-6 Fatty Acids", type: "inhibits", desc: "Omega-6 and omega-3 fats compete for the same enzymes. Modern diets are heavily omega-6 dominant (ratio 15:1 vs ideal 4:1) — reducing omega-6 intake from processed oils while boosting omega-3s restores the balance." }
    ]
  }
};

const NAV_ICONS = {
  home:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  recipes:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  menus:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  health: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  user:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
};

function NutrientDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const n = NUTRIENTS[slug];

  if (!n) {
    return (
      <div className="nd-page" style={{ padding: 60, textAlign: "center" }}>
        <p style={{ color: "#888" }}>Nutrient not found.</p>
        <button className="nd-back" onClick={() => navigate("/health-guide")}>
          ‹ Back to Health Guide
        </button>
      </div>
    );
  }

  return (
    <div className="nd-page">

      {/* Navbar */}
      <nav className="nd-navbar">
        <div className="nd-logo">🍲 RecipeDiscover</div>
        <div className="nd-nav-links">
          <a onClick={() => navigate("/home")}>{NAV_ICONS.home} Home</a>
          <a onClick={() => navigate("/recipes")}>{NAV_ICONS.recipes} Recipes</a>
          <a onClick={() => navigate("/menus")}>{NAV_ICONS.menus} Menus</a>
          <a className="nd-nav-active" onClick={() => navigate("/health-guide")}>{NAV_ICONS.health} Health Guide</a>
        </div>
        <div className="nd-search-box">
          {NAV_ICONS.search}
          <input
            placeholder="Search nutrients, vitamins, minerals..."
            onKeyDown={e => {
              if (e.key === "Enter" && e.target.value.trim()) {
                navigate("/health-guide");
              }
            }}
          />
        </div>
        <div className="nd-avatar"><ProfileDropdown /></div>
      </nav>

      <div className="nd-content">

        {/* Back link */}
        <button className="nd-back" onClick={() => navigate("/health-guide")}>
          ‹ Back to All Nutrients
        </button>

        {/* Nutrient header card */}
        <div className="nd-header-card">
          <span className="nd-header-emoji" style={{ background: n.color + "18" }}>{n.emoji}</span>
          <div>
            <h2 className="nd-header-name">{n.name}</h2>
            <p className="nd-header-desc">{n.desc}</p>
          </div>
        </div>

        {/* Daily Requirement */}
        <div className="nd-daily-req">
          <div className="nd-dr-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <strong>Daily Requirement</strong>
          </div>
          <p>{n.dailyReq}</p>
        </div>

        {/* Health Benefits */}
        <div className="nd-section">
          <h3 className="nd-section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={n.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Health Benefits
          </h3>
          <ul className="nd-benefits-list">
            {n.benefits.map((b, i) => (
              <li key={i}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Best Food Sources */}
        <div className="nd-section">
          <h3 className="nd-section-title">
            <span style={{ fontSize: "1.2rem" }}>🍎</span>
            Best Food Sources
          </h3>
          <div className="nd-sources-grid">
            {n.sources.map((s, i) => (
              <div className="nd-source-item" key={i}>
                <div className="nd-source-info">
                  <span className="nd-source-name">{s.name}</span>
                  <span className="nd-source-serving">{s.serving}</span>
                </div>
                <span className="nd-source-amount" style={{ color: n.color }}>{s.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deficiency Symptoms */}
        <div className="nd-deficiency">
          <h3 className="nd-deficiency-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Deficiency Symptoms
          </h3>
          <ul className="nd-deficiency-list">
            {n.deficiency.map((d, i) => (
              <li key={i}>
                <span className="nd-def-dot" />
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Tips */}
        <div className="nd-tips">
          <h3 className="nd-tips-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Tips for Optimal Intake
          </h3>
          <ol className="nd-tips-list">
            {n.tips.map((t, i) => (
              <li key={i}>
                <span className="nd-tip-num">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>

        {/* Did You Know */}
        <div className="nd-facts">
          <h3 className="nd-facts-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Did You Know?
          </h3>
          <div className="nd-facts-grid">
            {n.facts.map((f, i) => (
              <div className="nd-fact-item" key={i}>
                <span className="nd-fact-num" style={{ background: n.color }}>{i + 1}</span>
                <p>{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrient Interactions */}
        <div className="nd-interactions">
          <h3 className="nd-interactions-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Nutrient Interactions
          </h3>
          <p className="nd-interactions-sub">How {n.name} works with other nutrients in your body</p>
          <div className="nd-interactions-list">
            {n.interactions.map((inter, i) => (
              <div className="nd-interaction-item" key={i}>
                <div className="nd-interaction-top">
                  <span className={`nd-interaction-badge nd-badge-${inter.type}`}>
                    {inter.type === "enhances" ? "✓ Enhances" : inter.type === "inhibits" ? "⚠ Competes" : "○ Neutral"}
                  </span>
                  <span className="nd-interaction-nutrient">{inter.nutrient}</span>
                </div>
                <p className="nd-interaction-desc">{inter.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default NutrientDetail;
