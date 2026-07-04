(()=>{if(!window.ModalManager){const html=window.domHTML?.html;if(!html){console.error("domHTML.html non disponible pour ModalManager");return}class ModalBase{constructor(modalData=[]){this.activeModal=null,this.modalData=modalData,this.init()}init(){this.createModalButtons(),this.setupEventListeners()}setupEventListeners(){document.addEventListener("click",e=>{if(e.target.closest(".configurator-modal-button")){e.preventDefault(),e.stopPropagation();const modalId=e.target.closest(".configurator-modal-button").getAttribute("data-modal-id");this.openModal(modalId)}}),document.addEventListener("click",e=>{e.target.classList.contains("configurator-modal-backdrop")&&this.closeModal()}),document.addEventListener("click",e=>{e.target.closest(".configurator-modal-close")&&this.closeModal()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&this.activeModal&&this.closeModal()})}openModal(modalId){const modalIdStr=String(modalId),modalData=this.modalData.find(m=>String(m.id)===modalIdStr);if(!modalData)return;this.activeModal=modalData;const initialTabIndex=this.getInitialTabIndex(modalData),modalComponent=this.createModalComponent(modalData,initialTabIndex);if(!modalComponent)return;typeof this.injectDescriptionContent=="function"&&this.injectDescriptionContent(modalComponent),typeof this.injectInitialVideo=="function"&&this.injectInitialVideo(modalComponent,modalData,initialTabIndex),this.mountModal(modalComponent),document.body.style.overflow="hidden";const backdrop=document.body.lastElementChild;backdrop&&backdrop.classList.contains("configurator-modal-backdrop")&&this.playModalVideo(backdrop)}getInitialTabIndex(modalData){if(modalData.productType==="power"&&window.ConfiguratorApp?.instance){const app=window.ConfiguratorApp.instance,selectedClim=app.selectedProductOnly;if(selectedClim){const variant=app.findVariantByPowerLabel(modalData.tabs[0]?.buttonText||""),state=app.getClimState(selectedClim),currentVariant=(selectedClim.variants||[]).find(v=>String(v.id)===String(state.selectedVariantId));if(currentVariant){const tabIndex=modalData.tabs.findIndex(tab=>{const matchedVariant=app.findVariantByPowerLabel(tab.buttonText);return matchedVariant&&String(matchedVariant.id)===String(currentVariant.id)});if(tabIndex!==-1)return tabIndex+1}}}return 1}mountModal(modalComponent){if(!modalComponent){console.error("Impossible de monter la modale: composant invalide");return}const backdropElement=modalComponent.querySelector(".configurator-modal-backdrop");document.body.appendChild(modalComponent),setTimeout(()=>{backdropElement&&backdropElement.classList.add("active")},10)}closeModal(){if(!this.activeModal)return;const backdrop=document.querySelector(".configurator-modal-backdrop");backdrop&&(backdrop.classList.remove("active"),setTimeout(()=>{backdrop.remove()},300)),document.body.style.overflow="",this.activeModal=null}createModalButtons(){throw new Error("createModalButtons() doit \xEAtre impl\xE9ment\xE9e par la classe enfant")}createModalComponent(modalData){throw new Error("createModalComponent() doit \xEAtre impl\xE9ment\xE9e par la classe enfant")}}class TabbedModal extends ModalBase{constructor(modalData=[]){super(modalData)}createModalButtons(currentSplitsCount=0){const sectionMapping={clim:"configurator-content-split-type",power:"configurator-content-split-power",liaison:"configurator-content-split-readyclim",kitwifi:"configurator-content-split-wifi",services:"configurator-content-split-services"};this.modalData.forEach(modal=>{if(modal.splitsCount&&modal.splitsCount!==0&&modal.splitsCount!==currentSplitsCount)return;const productType=modal.productType,targetSectionId=sectionMapping[productType];targetSectionId&&this.createModalButton(modal,targetSectionId)})}updateButtons(currentSplitsCount){document.querySelectorAll(".configurator-modal-button:not([data-modal-id='energy-sheets'])").forEach(btn=>btn.remove()),this.createModalButtons(currentSplitsCount)}createModalButton(modalData,targetSectionId){const targetSection=document.getElementById(targetSectionId);if(!targetSection)return;const titleContainer=targetSection.querySelector(".configurator-content-title");if(!titleContainer)return;const buttonElement=html`
          <button
            class="configurator-modal-button"
            data-modal-id="${modalData.id}"
          >
            ${modalData.buttonText?html`<span>${modalData.buttonText}</span>`:""}
            ${modalData.buttonIcon?html`<img src="${modalData.buttonIcon}" alt="" />`:""}
          </button>
        `,arrow=titleContainer.querySelector(".configurator-title-icon-arrow");arrow?titleContainer.insertBefore(buttonElement,arrow):titleContainer.appendChild(buttonElement)}setupEventListeners(){super.setupEventListeners(),document.addEventListener("click",e=>{if(e.target.closest(".configurator-modal-tab")){const tabIndex=e.target.closest(".configurator-modal-tab").getAttribute("data-tab");this.switchTab(tabIndex)}})}createModalComponent(modalData,initialTabIndex=1){const activeIdx=initialTabIndex-1;if(!modalData||!modalData.tabs||!Array.isArray(modalData.tabs))return console.error("Donn\xE9es de modale invalides:",modalData),null;const showTabs=!(modalData.tabs.length===1&&!modalData.tabs[0].buttonText?.trim());return html`
          <div class="configurator-modal-backdrop">
            <div class="configurator-modal-drawer">
              <div class="configurator-modal-header">
                <h2>${modalData.modalTitle||"Information"}</h2>
                <button class="configurator-modal-close">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M0.557783 0.558272C0.674971 0.441229 0.833825 0.375488 0.99945 0.375488C1.16508 0.375488 1.32393 0.441229 1.44112 0.558272L11.4411 10.5583C11.5025 10.6155 11.5518 10.6845 11.5859 10.7612C11.6201 10.8378 11.6385 10.9206 11.6399 11.0045C11.6414 11.0884 11.626 11.1718 11.5946 11.2496C11.5631 11.3274 11.5163 11.3981 11.457 11.4575C11.3976 11.5168 11.3269 11.5636 11.2491 11.595C11.1713 11.6265 11.0879 11.6419 11.004 11.6404C10.9201 11.639 10.8373 11.6206 10.7607 11.5864C10.684 11.5523 10.615 11.503 10.5578 11.4416L0.557783 1.44161C0.440741 1.32442 0.375 1.16556 0.375 0.999938C0.375 0.834313 0.440741 0.675459 0.557783 0.558272Z"
                      fill="#141517"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M11.4417 0.558271C11.5587 0.675459 11.6245 0.834313 11.6245 0.999938C11.6245 1.16556 11.5587 1.32442 11.4417 1.44161L1.4417 11.4416C1.32322 11.552 1.16652 11.6121 1.0046 11.6093C0.842682 11.6064 0.688194 11.5408 0.573683 11.4263C0.459172 11.3118 0.393579 11.1573 0.390722 10.9954C0.387866 10.8335 0.447968 10.6768 0.558368 10.5583L10.5584 0.558271C10.6756 0.441229 10.8344 0.375488 11 0.375488C11.1657 0.375488 11.3245 0.441229 11.4417 0.558271Z"
                      fill="#141517"
                    />
                  </svg>
                </button>
              </div>
              <div class="configurator-modal-content">
                ${modalData.tabs[activeIdx]?.videoTag?html`<div class="configurator-modal-image video-container"></div>`:modalData.tabs[activeIdx]?.image?html`<div class="configurator-modal-image">
                          <img src="${modalData.tabs[activeIdx].image}" alt="" />
                        </div>`:""}
                ${showTabs?html` <div class="configurator-modal-tabs">
                      ${modalData.tabs.map((tab,index)=>html`<button
                            class="configurator-modal-tab ${index===activeIdx?"active":""}"
                            data-tab="${index+1}"
                          >
                            ${tab.buttonText||`Onglet ${index+1}`}
                          </button>`)}
                    </div>`:""}
                <div class="configurator-modal-tab-content">
                  ${modalData.tabs.map((tab,index)=>html`
                      <div
                        class="configurator-modal-tab-panel ${index===activeIdx?"active":""}"
                        data-tab="${index+1}"
                      >
                        ${tab.description?html`<div class="modal-description"></div>`:""}
                      </div>
                    `)}
                </div>
              </div>
            </div>
          </div>
        `}playModalVideo(container){if(!container)return;const video=container.querySelector("video");video&&video.play().catch(err=>{console.warn("La lecture automatique de la vid\xE9o a \xE9t\xE9 bloqu\xE9e:",err)})}injectDescriptionContent(container){!this.activeModal||!this.activeModal.tabs||this.activeModal.tabs.forEach((tab,index)=>{const tabIndex=index+1,panel=container.querySelector(`.configurator-modal-tab-panel[data-tab="${tabIndex}"]`);if(panel&&tab.description){const descEl=panel.querySelector(".modal-description");descEl&&(descEl.innerHTML=tab.description)}})}updateModalMedia(modalComponent,tabIndex){if(!this.activeModal||!this.activeModal.tabs)return;const mediaContainer=modalComponent.querySelector(".configurator-modal-image"),tab=this.activeModal.tabs[tabIndex-1];mediaContainer&&(tab?.videoTag?(mediaContainer.innerHTML=tab.videoTag,mediaContainer.classList.add("video-container"),mediaContainer.style.display="block",setTimeout(()=>this.playModalVideo(mediaContainer),50)):tab?.image?(mediaContainer.innerHTML=`<img src="${tab.image}" alt="" />`,mediaContainer.classList.remove("video-container"),mediaContainer.style.display="block"):mediaContainer.style.display="none")}injectInitialVideo(modalComponent,modalData,initialTabIndex=1){const activeIdx=initialTabIndex-1;if(modalData.tabs[activeIdx]?.videoTag){const videoContainer=modalComponent.querySelector(".configurator-modal-image.video-container");videoContainer&&(videoContainer.innerHTML=modalData.tabs[activeIdx].videoTag)}}mountModal(modalComponent){if(!modalComponent){console.error("Impossible de monter la modale: composant invalide");return}const backdropElement=modalComponent.querySelector(".configurator-modal-backdrop");document.body.appendChild(modalComponent),setTimeout(()=>{backdropElement&&backdropElement.classList.add("active")},10)}switchTab(tabIndex){if(!this.activeModal)return;const backdrop=document.querySelector(".configurator-modal-backdrop");if(!backdrop)return;backdrop.querySelectorAll(".configurator-modal-tab").forEach(tab=>{tab.classList.remove("active")}),backdrop.querySelectorAll(".configurator-modal-tab-panel").forEach(panel=>{panel.classList.remove("active")});const activeTab=backdrop.querySelector(`[data-tab="${tabIndex}"]`),activePanel=backdrop.querySelector(`.configurator-modal-tab-panel[data-tab="${tabIndex}"]`);if(activeTab&&activeTab.classList.add("active"),activePanel&&activePanel.classList.add("active"),this.updateModalMedia(backdrop,tabIndex),this.activeModal.productType==="power"&&window.ConfiguratorApp?.instance){const app=window.ConfiguratorApp.instance,tabData=this.activeModal.tabs[tabIndex-1];if(tabData&&tabData.buttonText){const variant=app.findVariantByPowerLabel(tabData.buttonText);variant&&app.selectVariantById(variant.id)}}}}class EnergySheetModal extends ModalBase{constructor(modalData=[]){super(modalData)}createModalButtons(){if(document.querySelector('.configurator-header-energy-badge .configurator-modal-button[data-modal-id="energy-sheets"]')){this.modalData&&this.modalData.length>0&&this.updateButtonIcon(this.modalData[0]);return}const energyBadge=document.querySelector(".configurator-header-energy-badge");energyBadge&&(!this.modalData||this.modalData.length===0||(this.energyButton=html`
          <button
            class="configurator-modal-button"
            data-modal-id="energy-sheets"
          >
            <img src="${this.modalData[0]?.logo||""}" alt="Énergie" />
          </button>
        `,energyBadge.appendChild(this.energyButton),this.modalData&&this.updateButtonIcon(this.modalData)))}createModalComponent(modalData){const energySheets=modalData?.sheets||null,fnrj=modalData?.fnrj||null,variantSku=modalData?.variantSku||null;let allSheets=[];energySheets&&(allSheets=allSheets.concat(Array.isArray(energySheets)?energySheets:[energySheets])),fnrj&&(allSheets=allSheets.concat(Array.isArray(fnrj)?fnrj:[fnrj]));const filteredSheets=this.filterSheetsBySku(allSheets,variantSku);return!filteredSheets||filteredSheets.length===0?html`
            <div class="configurator-modal-backdrop">
              <div class="configurator-modal-drawer">
                <div class="configurator-modal-header">
                  <h2>Fiches énergétiques</h2>
                  <button class="configurator-modal-close">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M0.557783 0.558272C0.674971 0.441229 0.833825 0.375488 0.99945 0.375488C1.16508 0.375488 1.32393 0.441229 1.44112 0.558272L11.4411 10.5583C11.5025 10.6155 11.5518 10.6845 11.5859 10.7612C11.6201 10.8378 11.6385 10.9206 11.6399 11.0045C11.6414 11.0884 11.626 11.1718 11.5946 11.2496C11.5631 11.3274 11.5163 11.3981 11.457 11.4575C11.3976 11.5168 11.3269 11.5636 11.2491 11.595C11.1713 11.6265 11.0879 11.6419 11.004 11.6404C10.9201 11.639 10.8373 11.6206 10.7607 11.5864C10.684 11.5523 10.615 11.503 10.5578 11.4416L0.557783 1.44161C0.440741 1.32442 0.375 1.16556 0.375 0.999938C0.375 0.834313 0.440741 0.675459 0.557783 0.558272Z"
                        fill="#141517"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M11.4417 0.558271C11.5587 0.675459 11.6245 0.834313 11.6245 0.999938C11.6245 1.16556 11.5587 1.32442 11.4417 1.44161L1.4417 11.4416C1.32322 11.552 1.16652 11.6121 1.0046 11.6093C0.842682 11.6064 0.688194 11.5408 0.573683 11.4263C0.459172 11.3118 0.393579 11.1573 0.390722 10.9954C0.387866 10.8335 0.447968 10.6768 0.558368 10.5583L10.5584 0.558271C10.6756 0.441229 10.8344 0.375488 11 0.375488C11.1657 0.375488 11.3245 0.441229 11.4417 0.558271Z"
                        fill="#141517"
                      />
                    </svg>
                  </button>
                </div>
                <div class="configurator-modal-content">
                  <div class="energy-sheet-empty">
                    <p>Aucune fiche énergétique disponible pour ce produit.</p>
                  </div>
                </div>
              </div>
            </div>
          `:html`
          <div class="configurator-modal-backdrop">
            <div class="configurator-modal-drawer">
              <div class="configurator-modal-header">
                <h2>Fiches énergétiques</h2>
                <button class="configurator-modal-close">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M0.557783 0.558272C0.674971 0.441229 0.833825 0.375488 0.99945 0.375488C1.16508 0.375488 1.32393 0.441229 1.44112 0.558272L11.4411 10.5583C11.5025 10.6155 11.5518 10.6845 11.5859 10.7612C11.6201 10.8378 11.6385 10.9206 11.6399 11.0045C11.6414 11.0884 11.626 11.1718 11.5946 11.2496C11.5631 11.3274 11.5163 11.3981 11.457 11.4575C11.3976 11.5168 11.3269 11.5636 11.2491 11.595C11.1713 11.6265 11.0879 11.6419 11.004 11.6404C10.9201 11.639 10.8373 11.6206 10.7607 11.5864C10.684 11.5523 10.615 11.503 10.5578 11.4416L0.557783 1.44161C0.440741 1.32442 0.375 1.16556 0.375 0.999938C0.375 0.834313 0.440741 0.675459 0.557783 0.558272Z"
                      fill="#141517"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M11.4417 0.558271C11.5587 0.675459 11.6245 0.834313 11.6245 0.999938C11.6245 1.16556 11.5587 1.32442 11.4417 1.44161L1.4417 11.4416C1.32322 11.552 1.16652 11.6121 1.0046 11.6093C0.842682 11.6064 0.688194 11.5408 0.573683 11.4263C0.459172 11.3118 0.393579 11.1573 0.390722 10.9954C0.387866 10.8335 0.447968 10.6768 0.558368 10.5583L10.5584 0.558271C10.6756 0.441229 10.8344 0.375488 11 0.375488C11.1657 0.375488 11.3245 0.441229 11.4417 0.558271Z"
                      fill="#141517"
                    />
                  </svg>
                </button>
              </div>
              <div class="configurator-modal-content energy-sheet-content">
                <div class="energy-sheet-gallery">
                  ${filteredSheets.map((sheet,index)=>html`
                      <div class="energy-sheet-item">
                        <img
                          src="${sheet}"
                          alt="Fiche énergétique ${index+1}"
                          loading="lazy"
                        />
                      </div>
                    `)}
                </div>
              </div>
            </div>
          </div>
        `}filterSheetsBySku(energySheets,variantSku){if(!energySheets)return[];const sheets=Array.isArray(energySheets)?energySheets:[energySheets];if(!variantSku)return sheets;const filtered=sheets.filter(sheet=>typeof sheet=="string"&&sheet.includes(variantSku));return filtered.length>0?filtered:sheets}updateModalData(modalData){modalData&&(Array.isArray(modalData)?this.modalData=modalData:this.modalData=[modalData],this.updateButtonIcon(modalData))}updateButtonIcon(modalData){const logoUrl=(Array.isArray(modalData)?modalData[0]:modalData)?.logo||"",img=document.querySelector('.configurator-header-energy-badge .configurator-modal-button[data-modal-id="energy-sheets"] img');img&&logoUrl&&(img.src=logoUrl)}}window.ModalManager={ModalBase,TabbedModal,EnergySheetModal}}})();
//# sourceMappingURL=/cdn/shop/t/284/assets/configurator-modal.js.map?v=168875591876710681091774608811
