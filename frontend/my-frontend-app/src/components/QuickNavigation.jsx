function QuickNavigation({ onBrowse, onMenus }) {

return(

<section className="quick-nav">

<h2>Quick Navigation</h2>

<div className="quick-buttons">

<button className="btn orange" onClick={onBrowse}>
Browse Recipes
</button>

<button className="btn green" onClick={onMenus}>
View Menus
</button>

<button className="btn blue">
Health Guide
</button>

<button className="btn purple">
My Profile
</button>

</div>

</section>

)

}

export default QuickNavigation