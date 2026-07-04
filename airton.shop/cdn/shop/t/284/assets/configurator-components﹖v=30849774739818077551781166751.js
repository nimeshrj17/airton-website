(function(){function defaultFormat(cents){try{var locale=document.documentElement.lang||"fr-FR";return(cents/100).toLocaleString(locale,{style:"currency",currency:"EUR"})}catch{return(cents/100).toFixed(2)+" \u20AC"}}class Badge{constructor(text,style){this.text=text,this.style=style}render(){var html=window.domHTML.html;return html`<div class="clim-badge" style="${this.style}">
        ${this.text}
      </div>`}}class ClimSplitCard{constructor(onSelect,imageUrl,title,subtitle,price,isBestSeller,isSelected,isDisabled,comparePrice){this.onSelect=onSelect,this.imageUrl=imageUrl,this.title=title,this.subtitle=subtitle,this.price=price,this.isBestSeller=isBestSeller,this.isSelected=!!isSelected,this.isDisabled=!!isDisabled,this.comparePrice=comparePrice}render(){var html=window.domHTML.html;const node=html`
        <div
          class="clim-split-card ${this.isDisabled?"configurator--disabled":""} ${this.isSelected&&!this.isDisabled?"configurator--selected-card":""}"
        >
          ${this.isBestSeller?new Badge("Le plus vendu","").render():""}
          <img src="${this.imageUrl}" alt="" width="70" height="70" />
          <h4 class="clim-split-card__title">${this.title}</h4>
          <p class="clim-split-card__subtitle">${this.subtitle}</p>
          <p class="clim-split-card__price">
            ${this.comparePrice?html`<s class="configurator-price-compare"
                  >${this.comparePrice}</s
                >`:""}
            <span class="configurator-price-sale">${this.price||""}</span>
          </p>
        </div>
      `.firstElementChild;return node.addEventListener("click",this.onSelect),node}}class ConfiguratorOptionChip{constructor(onSelect,text,price,isSelected,isDisabled,comparePrice){this.onSelect=onSelect,this.text=text,this.price=price,this.isSelected=!!isSelected,this.isDisabled=!!isDisabled,this.comparePrice=comparePrice}render(){var html=window.domHTML.html;const node=html` <div
        class="configurator-option-chip ${this.isDisabled?"configurator--disabled":""} ${this.isSelected&&!this.isDisabled?"configurator--selected-card":""}"
      >
        <p class="configurator-option-chip__text">${this.text}</p>
        ${this.price||this.comparePrice?html`<p class="configurator-option-chip__price">
              ${this.comparePrice?html`<s class="configurator-price-compare"
                    >${this.comparePrice}</s
                  >`:""}
              <span class="configurator-price-sale">${this.price}</span>
            </p>`:""}
      </div>`.firstElementChild;return node.addEventListener("click",this.onSelect),node}}class ConfiguratorPlusOptionChip{constructor(onSelect){this.onSelect=onSelect}render(){var html=window.domHTML.html;const node=html` <div class="configurator-option-chip">
        <p class="configurator-option-chip__plus">
          <svg
            width="13"
            height="15"
            viewBox="0 0 13 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 8.56486V7.0424H5.68342V0.853271H7.31658V7.0424H13V8.56486H7.31658V14.8533H5.68342V8.56486H0Z"
              fill="#016FD0"
            />
          </svg>
        </p>
      </div>`.firstElementChild;return node.addEventListener("click",this.onSelect),node}}class ConfiguratorAlmaCard{constructor(containerElement){typeof containerElement=="string"?this.containerId=containerElement:containerElement&&containerElement.id&&(this.containerId="#"+containerElement.id),this._almaEnsureInstance(),this.rerenderFunction=this.rerenderFunction.bind(this)}_almaEnsureInstance(){return!window.__almaWidgetsInstance&&window.Alma&&window.Alma.Widgets&&(window.__almaWidgetsInstance=Alma.Widgets.initialize("merchant_11jBcla6isy7JIWn22uCE4SkwiMoH3Kcoa",Alma.ApiMode.LIVE)),window.__almaWidgetsInstance}_renderAlmaWithAmount(amountCents){var widgets=this._almaEnsureInstance();if(!(!widgets||typeof amountCents!="number"||amountCents<=0)){var container=this.containerId;widgets.add(Alma.Widgets.PaymentPlans,{container,purchaseAmount:amountCents,locale:document.documentElement.lang||"fr",hideIfNotEligible:!1,transitionDelay:5500,monochrome:!0,hideBorder:!1,plans:[{installmentsCount:2,minAmount:7500,maxAmount:75e4},{installmentsCount:3,minAmount:7500,maxAmount:75e4},{installmentsCount:4,minAmount:7500,maxAmount:75e4},{installmentsCount:10,minAmount:7500,maxAmount:75e4},{installmentsCount:12,minAmount:7500,maxAmount:75e4}]})}}rerenderFunction(){return amountCents=>{this._renderAlmaWithAmount(amountCents)}}}window.ConfiguratorComponents={ClimSplitCard,Badge,ConfiguratorOptionChip,ConfiguratorPlusOptionChip,ConfiguratorAlmaCard}})();
//# sourceMappingURL=/cdn/shop/t/284/assets/configurator-components.js.map?v=30849774739818077551781166751
