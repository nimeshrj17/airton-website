
    (function() {
      var preconnectOrigins = ["https://cdn.shopify.com","https://extensions.shopifycdn.com"];
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills-legacy.CnjmRObu.js","/cdn/shopifycloud/checkout-web/assets/c1/app-legacy.XuxqDYKD.js","/cdn/shopifycloud/checkout-web/assets/c1/esnext-vendor-legacy.CepVunzw.js","/cdn/shopifycloud/checkout-web/assets/c1/context-browser-legacy.BNXGXG3e.js","/cdn/shopifycloud/checkout-web/assets/c1/types-UnauthenticatedErrorModalPayload-legacy.DN-VgnFz.js","/cdn/shopifycloud/checkout-web/assets/c1/proposal-delegated-payment-instrument-legacy.0ZGLYDcT.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-shop-discount-offer-legacy.asnufvXu.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-shopId-legacy.BE3MaS0b.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-PaymentSessionMutation-legacy.CRMveZ-M.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-ShopPayCheckoutSessionQuery-legacy.px-LCjuU.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-UserPrivacySettingsSetMutation-legacy.ByHp5pAM.js","/cdn/shopifycloud/checkout-web/assets/c1/extensions-rpc-legacy.kXhHyuhb.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-getCommonShopPayExternalTelemetryAttributes-legacy.DSW2HKSj.js","/cdn/shopifycloud/checkout-web/assets/c1/hydrate-legacy.DGZmmt7r.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-fr-legacy.DDPZh_Ml.js","/cdn/shopifycloud/checkout-web/assets/c1/page-OnePage-legacy.C1e_utLU.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useWalletsTimeout-legacy.DOKq9Mr3.js","/cdn/shopifycloud/checkout-web/assets/c1/remember-me-hooks-legacy.B_XRbixq.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useUnauthenticatedErrorModal-legacy.uoJPkWjN.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useStableHostMethodsReferences-legacy.CYzL0Qo1.js","/cdn/shopifycloud/checkout-web/assets/c1/OffsitePaymentFailed-legacy.Bs5pSfkn.js","/cdn/shopifycloud/checkout-web/assets/c1/SplitDeliveryMerchandiseContainer-legacy.BFFShkmZ.js","/cdn/shopifycloud/checkout-web/assets/c1/ChangeCompanyLocationLink-legacy.CujHKqBe.js","/cdn/shopifycloud/checkout-web/assets/c1/WalletsSandbox-WalletSandbox-legacy.BVOjQB1F.js","/cdn/shopifycloud/checkout-web/assets/c1/BillingAddressForm-legacy.CG2lWvCy.js","/cdn/shopifycloud/checkout-web/assets/c1/PhoneField-legacy.EsaqmPdC.js","/cdn/shopifycloud/checkout-web/assets/c1/images-flag-icon-legacy.Bfupgm8k.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingMethodRateLabel-legacy.GRdb54_3.js","/cdn/shopifycloud/checkout-web/assets/c1/CompactChoiceList-legacy.D_hpvZQV.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useSuppressShopPayModalOnLoad-legacy.CHgn2xo0.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePostPurchase-legacy.TeKlFSX9.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayCheckoutGqlVersion-legacy.C3bHDIQ8.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useForceShopPayUrl-legacy.DfX4_iB1.js","/cdn/shopifycloud/checkout-web/assets/c1/CaptureEvents-ButtonWithRegisterWebPixel-legacy.CuXMx_Rx.js","/cdn/shopifycloud/checkout-web/assets/c1/GooglePayButton-index-legacy.C8UEiWiP.js","/cdn/shopifycloud/checkout-web/assets/c1/PendingShipping-legacy.EMtH5EnE.js","/cdn/shopifycloud/checkout-web/assets/c1/AutocompleteField-hooks-legacy.Dzm-Lh0M.js","/cdn/shopifycloud/checkout-web/assets/c1/LocalizationExtensionField-legacy.CMexBqPm.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayPaymentRequiredMethod-legacy.0LoT5Gdf.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useUpdateCheckoutAddress-legacy.EdCv7bfs.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useGeneralPaymentErrorMessage-legacy.HHicOonB.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentLine-legacy.D0ITqSQI.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentIcon-legacy.Bb9xncB9.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPayButtonClassName-legacy.cqPQY1YG.js","/cdn/shopifycloud/checkout-web/assets/c1/billing-address-hooks-legacy.r4JSic-d.js","/cdn/shopifycloud/checkout-web/assets/c1/WalletLogo-legacy.D0VSs8Ti.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShowShopPayOptin-legacy.6TzBp9mK.js","/cdn/shopifycloud/checkout-web/assets/c1/Section-legacy.WtAEsYjo.js","/cdn/shopifycloud/checkout-web/assets/c1/MobileOrderSummary-legacy.Bj2Tz2PC.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useOnePageFormSubmit-legacy.C-MuybN-.js","/cdn/shopifycloud/checkout-web/assets/c1/PayPalOverCaptureInfoBanner-legacy.CTeRUwF_.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-get-negotiation-input-legacy.SBqBqQrb.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopCashCheckoutEligibility-legacy.DdK7xLvi.js","/cdn/shopifycloud/checkout-web/assets/c1/redemption-constants-legacy.CxiN0GmP.js","/cdn/shopifycloud/checkout-web/assets/c1/BillingAddressSelector-legacy.nOdV5yPM.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentErrorBanner-legacy.DNyvnFls.js","/cdn/shopifycloud/checkout-web/assets/c1/StockProblems-StockProblemsLineItemList-legacy.oY46FMGI.js","/cdn/shopifycloud/checkout-web/assets/c1/DutyOptions-legacy.BRWoJLeO.js","/cdn/shopifycloud/checkout-web/assets/c1/ShipmentBreakdown-legacy.Bfg6hwon.js","/cdn/shopifycloud/checkout-web/assets/c1/MerchandiseModal-legacy.CisbJg69.js","/cdn/shopifycloud/checkout-web/assets/c1/extension-targets-shipping-options-legacy.CWyhaqtM.js","/cdn/shopifycloud/checkout-web/assets/c1/StackedMerchandisePreview-legacy.D1_fFmkq.js","/cdn/shopifycloud/checkout-web/assets/c1/EstimatedDeliveryContent-legacy.CA69ndjY.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingMethodSelector-legacy.6QK4brZ1.js","/cdn/shopifycloud/checkout-web/assets/c1/TextArea-legacy.BpwhH0Ss.js","/cdn/shopifycloud/checkout-web/assets/c1/SubscriptionPriceBreakdown-legacy.DUgO204n.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePaypalRowEffects-legacy.CID90taq.js","/cdn/shopifycloud/checkout-web/assets/c1/Switch-legacy.BVLs-OG3.js","/cdn/shopifycloud/checkout-web/assets/c1/Middot-legacy.CeNnPVJc.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingGroupsSummaryLine-legacy.C92qr9Qn.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-publishMessage-legacy.Di4_Q4lB.js","/cdn/shopifycloud/checkout-web/assets/c1/component-RuntimeExtension-legacy.Du0O3xSD.js","/cdn/shopifycloud/checkout-web/assets/c1/AnnouncementRuntimeExtensions-legacy.ApaRA1Xn.js","/cdn/shopifycloud/checkout-web/assets/c1/QRCode-legacy.CP12vSkq.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-dates-legacy.DCA0mtXE.js","/cdn/shopifycloud/checkout-web/assets/c1/NumberField-legacy.BcknkYf9.js","/cdn/shopifycloud/checkout-web/assets/c1/Extensions-ExtensionSkeletonTimer-legacy.C3pTn-js.js","/cdn/shopifycloud/checkout-web/assets/c1/dist-v4-legacy.hxLzMo8h.js","/cdn/shopifycloud/checkout-web/assets/c1/ExtensionsInner-legacy.B_dG0gBG.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePickupPoints-legacy.BP9KSONY.js","/cdn/shopifycloud/checkout-web/assets/c1/sandbox.DkO8L5dF.worker.js","/cdn/shopifycloud/checkout-web/assets/c1/sandbox-2025-07.CivPyZjb.worker.js","https://extensions.shopifycdn.com/shopifycloud/checkout-web/assets/c1/polyfills-entry-legacy.lvCUB399.worker.js"];
      var styles = [];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = ["https://cdn.shopify.com/s/files/1/2600/0244/files/Trustpilot_Final_Grand_x320.png?v=1756979910"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = preconnectOrigins.concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  