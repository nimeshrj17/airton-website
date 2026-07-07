const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// 1. Generate the two new pages
const baseHtmlFile = './airton.shop/pages/livraison.html';
const baseHtmlContent = fs.readFileSync(baseHtmlFile, 'utf8');

const refundPolicyText = `
<h1>Politique de remboursement</h1>
<h2>Effets de la rétractation</h2>
<p>L'Acheteur devra renvoyer les produits à l’adresse indiquée par AIRTON lors de la confirmation de l’enregistrement de la décision de rétractation, rappelant le numéro de commande et ses coordonnées complètes et accompagnés du bordereau de retour dûment rempli, sans retard excessif et, au plus tard, dans les quatorze (14) jours suivant la communication de sa décision.</p>
<p>Les frais directs de renvoi des produits ainsi que les risques de retour restent à la charge de l'Acheteur.</p>
<p>Les produits devront être retournés dans leur emballage d'origine, dans leur état initial, en parfait état, ni ouvert, ni déballé, accompagnés de l'ensemble des accessoires et notices et accompagnés de leur facture.</p>
<p>La responsabilité de l'Acheteur sera engagée à l'égard de la dépréciation des produits résultant des manipulations autres que celles nécessaires pour établir la nature au bon fonctionnement des produits.</p>
<p>En cas de demande de remboursement, AIRTON procèdera au remboursement de l'Acheteur de l'ensemble des sommes versées par l'Acheteur correspondantes au prix de vente du produit retourné minoré des frais de retour.</p>
<p>Toutefois, AIRTON ne remboursera pas à l'Acheteur le prix des produits ouverts, retournés incomplets ou détériorés par l'Acheteur. Ces produits feront l'objet d'une réexpédition à l'Acheteur, à ses frais.</p>
`;

const termsText = `
<h1>Conditions d’utilisation</h1>

<h3>ARTICLE 1– OBJET - CHAMP D’APPLICATION</h3>
<p>Les présentes conditions générales de vente et de prestations de services ont pour objet de régir les ventes conclues à distance par la société Starlight avec les internautes par le biais du site Internet eu.airton.shop</p>
<p>Le fait pour l'Acheteur de passer commande sur le Site implique son acceptation sans réserve et son adhésion aux présente Conditions Générales de Vente et prestation de service. A ce titre, l'Acheteur déclare avoir pris connaissance et accepter les Conditions Générales de Vente avant passation de sa commande.</p>
<p>Les offres de vente proposées par AIRTON sont exclusivement destinées à la clientèle disposant de la capacité de contracter, et ne sont afférente qu’au territoire de la France métropolitaine et de l'UE.</p>

<h3>ARTICLE 2 - LA COMMANDE</h3>
<p>Pour passer une commande sur le Site, l'Acheteur devra se conformer aux indications qui lui sont données sur le Site.</p>
<p><strong>Comment passer commande?</strong></p>
<p>L'Acheteur doit remplir le formulaire de commande en veillant à donner les informations nécessaires complètes et exactes.</p>
<p>La procédure de commande est la suivante :</p>
<ul>
    <li>L'Acheteur sélectionne les produits ou services en cliquant sur le bouton “ajouter au panier” correspondant au produit désiré.</li>
    <li>Dès l’ajout d’un produit au panier, l’acheteur est invité à continuer ses achats ou à cliquer sur “PASSER LA COMMANDE” afin d’aller dans son panier.</li>
    <li>En cliquant sur l’onglet “MON PANIER”, l’acheteur peut renseigner les quantités des produits qu'il souhaite commander déjà ajoutés au panier.</li>
    <li>Depuis son panier, l’acheteur clique sur “PASSER AU PAIEMENT”, il est alors invité à se connecter à un compte existant, créer un compte ou commander sans créer de compte. Selon l’option choisie, il est alors invité à rentrer ses coordonnées de livraison et de facturation ou vérifier les coordonnées existantes.</li>
    <li>Afin de poursuivre la commande, l’acheteur clique sur le bouton “PASSER AU PAIEMENT”, il est alors invité à vérifier le mode de livraison et à accepter les présentes conditions générales de vente. Une fois celle-ci acceptées, il clique de nouveau sur le bouton “PASSER AU PAIEMENT”.</li>
    <li>Un récapitulatif de la commande est alors soumis à l'Acheteur. Il peut alors contrôler et modifier sa commande en tout ou partie ou de cliquer sur la fonction “ Poursuivre les achats " pour ajouter de nouveaux produits ou services.</li>
    <li>L'Acheteur valide – de manière définitive – le contenu et le montant de la commande. La validation – qui vaut acceptation expresse de l'Acheteur – est matérialisée par l'action de cliquer sur le bouton “Payer”, ou en sélectionnant un autre moyen de paiement.</li>
</ul>

<h3>ARTICLE 3 – LA VALIDATION ET LE PAIEMENT DE LA COMMANDE</h3>
<p>Les prix sont exclusivement payables en euros (€).</p>
<p>L'Acheteur procède au règlement immédiat de sa commande selon les modalités précisées ci-après.</p>
<p>A réception du paiement intégral de la commande, AIRTON procèdera à la validation de la commande.</p>
<p>AIRTON se réserve le droit de ne pas donner suite à la commande passée par l'Acheteur en cas d'impossibilité de mettre en œuvre le moyen de paiement de l’Acheteur ainsi qu’en cas de motif légitime au sens de l'article L.122-1 du Code de la consommation.</p>
<p>AIRTON informera alors l'Acheteur du refus de sa commande.</p>
<p><strong>Le paiement en ligne de la commande</strong></p>
<p>L'Acheteur renseigne ses coordonnées bancaires sur le Site au cours du processus de commande.</p>
<p>Un système de paiement en ligne sécurisé est mis en œuvre par AIRTON. Ainsi, toutes les données bancaires sont cryptées afin que les informations communiquées soient protégées lors de leur transmission.</p>
<p>Le refus d'autorisation par le centre bancaire emporte l'annulation de plein droit la commande de l’Acheteur.</p>
<p>La commande de l'Acheteur est validée par AIRTON dès l'acceptation par le partenaire bancaire d’AIRTON de la mise en œuvre du moyen de paiement de l'Acheteur.</p>
<p>L'Acheteur garantit au Vendeur qu'il est habilité à utiliser le mode de paiement utilisé pour le règlement de sa commande et notamment dispose lors de la validation de la commande, des autorisations nécessaires pour utiliser ce mode de paiement.</p>
<p>Si un incident survient lors de l'enregistrement de la commande de l'Acheteur, celle-ci sera nulle et non-avenue et l'Acheteur devra réitérer la procédure de passation de commande</p>

<h3>ARTICLE 4 - PRODUITS ET PRESTATIONS DE SERVICES</h3>
<p><strong>Caractéristiques des produits et des prestations de services</strong> L'Acheteur est informé sur le Site des caractéristiques essentielles des produits et des prestations de services.</p>
<p>L'Acheteur est invité à prendre connaissance des notices d'emploi ou de toute autre information jointe au produit ou portés sur le produit ou son emballage (précautions d'emploi, conditions d’utilisation)</p>
<p>AIRTON informe l’acheteur que la mise en service de ses climatiseurs Airton peut être effectuée par l'acheteur lui-même, à condition d'utiliser le système ReadyClim. Autrement, ce dernier devra régler la prestation d'un professionnel frigoriste agréé, avec une attestation de capacité.</p>
<p>L’utilisation des produits sera réalisée sous la seule responsabilité de l'Acheteur. Dans ces conditions, l'Acheteur est tenu d'assurer le maintien en bon état du produit, de l'utiliser conformément à sa destination.</p>
<p>AIRTON ne pourra en aucun cas être responsable des défauts et détériorations des produits livrés consécutifs à une utilisation anormale ou non conforme postérieure à la livraison de ces produits.</p>
<p><strong>Les disponibilités</strong></p>
<p>Les offres d’AIRTON s'entendent dans la limite des stocks disponibles et, le cas échéant, dans la limite des délais indiqués.</p>
<p>Les produits affichés disponibles peuvent ne plus l'être au moment de la passation de la commande de l'Acheteur. En conséquence la vente n'est conclue qu'après validation par AIRTON de la commande passée par l'Acheteur au regard de la disponibilité des produits commandés.</p>
<p>En cas d'indisponibilité totale ou partielle d'un produit commandé, l'Acheteur aura la possibilité d’annuler l'intégralité de sa commande, sans frais ou de confirmer sa commande s'agissant des articles commandés disponibles.</p>

<h3>ARTICLE 5 - PRIX</h3>
<p>Les prix affichés sur le Site sont indiqués en euros (€), toutes taxes comprises (T.T.C.) et hors frais de port.</p>
<p>Le coût global de sa commande comprenant le prix global TTC de la commande au taux de TVA effectivement applicable ainsi que les frais de livraison, sera communiqué à l'Acheteur avant validation définitive de la commande.</p>
<p>Les taxes applicables à la commande et notamment la TVA sont celles en vigueur au jour de la passation de la commande.</p>

<h3>ARTICLE 6 - FRAIS DE PORT</h3>
<p>Certaines commandes donnent lieu à facturation d'une participation aux frais d’envoi. Les frais d’envoi des produits AIRTON sont identiques sur l’ensemble du territoire en France métropolitaine (hors corse). Des frais supplémentaires peuvent être applicables sur le territoire Européen.</p>
<p>S’agissant des livraisons des accessoires et pièces détachés, des tarifications particulières peuvent être appliquées en France métropolitaine et de l'Union européenne.</p>

<h3>ARTICLE 7 - LIVRAISON DES PRODUITS</h3>
<p>Les produits commandés sont livrés au lieu de livraison mentionné sur la commande. La commande pourra être livrée en plusieurs colis à la discrétion de AIRTON, sans que cela entraine des frais supplémentaires pour l'Acheteur.</p>
<p>Il est précisé que l'Acheteur a la possibilité d'indiquer une adresse de livraison différente de l'adresse de facturation.</p>
<p>Les livraisons s’effectuent sur le territoire de la France continentale ainsi qu’en Union européenne</p>
<p>Afin que votre livraison se déroule dans les meilleures conditions, voici quelques conseils :</p>
<ul>
    <li>Comptez vos colis et contrôlez l'état extérieur des emballages.</li>
    <li>Remplissez vous-même votre bordereau de livraison que les livreurs vous feront signer.</li>
    <li>Notez votre nom, l'heure et la date de livraison, et signez votre bordereau de livraison en ayant pris le soin de bien cocher les cases sur le bordereau.</li>
    <li>Si un colis est abîmé et/ou manquant, merci d'en noter la référence sur le bordereau de livraison et de préciser si le colis est refusé et/ou accepté.</li>
</ul>
<p>Nous attirons votre attention sur le fait qu'aucune réclamation ne pourra être acceptée sans application de ces procédures.</p>
<p>Nous vous rappelons que la mention « sous réserve de déballage » n'a aucune valeur.</p>

<h3>ARTICLE 8 - DELAIS DE LIVRAISON</h3>
<p>Les délais de livraison courent à compter de la validation de la commande par AIRTON qui s'engage à livrer les produits commandés dans les délais les plus courts.</p>
<p>AIRTON s'engage à mettre en œuvre l'ensemble des moyens nécessaires au respect des délais de livraison indiqués au moment de la validation de la commande.</p>
<p>Dans tous les cas, la livraison dans le délai indiqué ne peut intervenir que si l'Acheteur a remplit toutes ses obligations à l'égard d’AIRTON.</p>
<p>L'Acheteur s'engage à fournir à AIRTON une adresse de livraison valide ainsi que ses coordonnées exactes.</p>
<p>En cas d'informations inexactes ou erronées, AIRTON ne saurait notamment être tenue responsable de l’impossibilité de livraison.</p>
<p>La livraison n'inclut pas la mise en service des appareils.</p>
<p>Si le colis est retourné à AIRTON pour adresse incomplète, AIRTON s'engage à contacter l'Acheteur pour l'informer de la situation et demander un complément d'information sur l'adresse ou la nouvelle adresse d'expédition. Les frais de cette nouvelle expédition ainsi que les frais de retour liés à celle-ci, préalablement communiqués à l'Acheteur par AIRTON seront à la charge de l’Acheteur.</p>

<h3>ARTICLE 9 – CONFORMITÉ DES PRODUITS</h3>
<p>A la réception de la marchandise, l’acheteur doit impérativement contrôler le colis et en vérifier le contenu en présence du livreur, avant de signer le bordereau de livraison.</p>
<p>Si les produits livrés ont subi des avaries et sont détériorés, l’acheteur doit impérativement refuser le colis en inscrivant le motif du refus sur le bordereau de livraison. A défaut de réserves sur le bordereau de livraison, la marchandise sera considérée comme livrée conforme.</p>
<p>Dès lors que le bordereau de livraison est signé, sans réserve précise, les responsabilités du transporteur et de AIRTON seront dégagées au titre des dommages éventuellement occasionnés au cours des opérations de livraison, à l'exception des garanties légales.</p>

<h3>ARTICLE 10 – LES PRESTATIONS DE SERVICES</h3>
<p>Les prestations de services proposées par AIRTON à titre accessoire, recouvrent les prestations d’installation des produits et mise en service.</p>
<p><strong>La garantie premium</strong></p>
<p>La garantie commerciale (premium) proposée par Airton, ne se substitue pas à la garantie légale de conformité. La souscription à celle-ci peut être effectuée lors de l’achat de votre climatiseur ou dans les 30 jours suivant l’achat de celui-ci.</p>
<p>L'intégralité des conditions et des avantages de celle-ci se trouve ici.</p>

<h3>ARTICLE 11 – FORCE MAJEURE</h3>
<p>AIRTON ne saurait être tenu pour responsable de l'inexécution de tout ou partie de ses obligations, due à la survenance d'un événement de force majeure.</p>
<p>Ainsi, en cas de survenance d'un cas fortuit ou d'un cas de force majeure qui gênerait ou retarderait l'exécution des obligations de AIRTON en tout ou partie, l'exécution par AIRTON desdites obligations sera suspendue.</p>
<p>Sont considérés comme tels à titre d’exemple sans que cette liste soit limitative : les catastrophes naturelles, les intempéries, guerres, attentats ou tous autres faits analogues.</p>
<p>Et plus généralement tous événements extérieurs à la volonté de AIRTON, et empêchant de bonne foi AIRTON d’honorer ses obligations.</p>

<h3>ARTICLE 12 – DROIT DE RÉTRACTATION</h3>
<p>Conformément aux dispositions de l'article L.121-21 et suivants du Code de la consommation, l'Acheteur dispose d'un délai de rétractation de quatorze (14) jours pour annuler sa commande, sans avoir à motiver sa décision.</p>
<p>Le délai de rétractation de quatorze (14) jours court à compter du jour de la réception du produit par l'Acheteur.</p>
<p>Dans le cas d'une commande portant sur plusieurs produits livrés séparément, le délai de rétractation expire quatorze (14) jours après que l’Acheteur prend physiquement possession du dernier produit.</p>
<p>Pour exercer ce droit de rétractation, l'Acheteur devra notifier à AIRTON sa décision de se rétracter avant l'expiration du délai indiqué ci-dessus, rappelant le numéro de commande et ses coordonnées complètes.</p>
<p>Après vérification par AIRTON, l'Acheteur reçoit un e-mail de confirmation de l'enregistrement de l'exercice de son droit de rétractation.</p>
<p>Conformément à l'article L.121-21-8 du Code de la consommation, l'Acheteur ne pourra pas exercer son droit de rétractation : Dans le cas de la vente de produits personnalisés, confectionnés selon les spécifications de l’Acheteur.</p>

<p><strong>Effets de la rétractation</strong></p>
<p>L'Acheteur devra renvoyer les produits à l’adresse indiquée par AIRTON lors de la confirmation de l’enregistrement de la décision de rétractation, rappelant le numéro de commande et ses coordonnées complètes et accompagnés du bordereau de retour dûment rempli, sans retard excessif et, au plus tard, dans les quatorze (14) jours suivant la communication de sa décision.</p>
<p>Les frais directs de renvoi des produits ainsi que les risques de retour restent à la charge de l'Acheteur.</p>
<p>Les produits devront être retournés dans leur emballage d'origine, dans leur état initial, en parfait état, ni ouvert, ni déballé, accompagnés de l'ensemble des accessoires et notices et accompagnés de leur facture.</p>
<p>La responsabilité de l'Acheteur sera engagée à l'égard de la dépréciation des produits résultant des manipulations autres que celles nécessaires pour établir la nature au bon fonctionnement des produits.</p>
<p>En cas de demande de remboursement, AIRTON procèdera au remboursement de l'Acheteur de l'ensemble des sommes versées par l'Acheteur correspondantes au prix de vente du produit retourné minoré des frais de retour.</p>
<p>Toutefois, AIRTON ne remboursera pas à l'Acheteur le prix des produits ouverts, retournés incomplets ou détériorés par l'Acheteur. Ces produits feront l'objet d'une réexpédition à l'Acheteur, à ses frais.</p>

<p><strong>Refus de livraison</strong></p>
<p>Dans le cas d’un refus de livraison durant la période légale de rétractation de 14 jours, et dans le cas d’une demande de remboursement par l’acheteur, des frais de transport moyennant un tarif de 60€ TTC seront automatiquement déduits du montant total de la commande (hors chronopost).</p>
<p>Concernant les commandes d’accessoires (hors climatiseurs), un montant de 14,99€ TTC sera automatiquement déduits du montant total de la commande</p>
<p>Ces frais valant participation aux frais engagés par AIRTON pour la non-livraison et le rapatriement de la marchandise.</p>
<p>Le remboursement interviendra après réception et vérifications des produits par AIRTON.</p>
<p>AIRTON effectue le remboursement en utilisant le même moyen de paiement que celui utilisé par l'Acheteur pour la transaction initiale</p>

<h3>ARTICLE 13 – GARANTIE DES PRODUITS</h3>
<p>AIRTON est tenue des défauts de conformité du produit dans les conditions des articles L.211-4 et suivants du Code de la Consommation et des défauts cachés de la chose vendue dans les conditions prévues aux articles 1641 et suivants du Code Civil.</p>
<p>Lorsque l'Acheteur agit en garantie légale de conformité ce dernier bénéficie d'un délai de deux ans à compter de la délivrance du produit pour agir.</p>
<p>L’acheteur peut choisir entre la réparation ou le remplacement du produit, sous réserve des conditions de coût prévues par l'article L. 211-9 du Code de la Consommation.</p>
<p>La garantie légale de conformité s'applique indépendamment de la garantie commerciale éventuellement consentie.</p>
<p>L'Acheteur peut décider de mettre en œuvre la garantie contre les défauts cachés de la chose vendue au sens de l'article 1641 du Code Civil et dans cette hypothèse, il peut choisir entre la résolution de la vente ou une réduction du prix de vente conformément à l'article 1644 du Code Civil.</p>
<p>Il est essentiel de souligner que la garantie constructeur offerte par Airton ne sera applicable que si l'installation et la mise en service du climatiseur respectent les lois et réglementations locales en vigueur dans le pays concerné. Dans le cas contraire, le client ne pourra pas bénéficier de la garantie constructeur et Airton se réserve le droit de refuser toute prise en charge en cas de problème ou de défaut du produit. Les clients sont tenus de se renseigner et de se conformer à toutes les lois applicables pour assurer le respect des conditions de garantie et la protection de leurs droits.</p>

<h3>ARTICLE 14 - RESERVE DE PROPRIETE</h3>
<p>Les produits livrés demeurent la propriété de AIRTON jusqu'à paiement complet et effectif du prix par l'Acheteur. Ces dispositions ne font pas obstacle, à compter de la livraison, au transfert à l'Acheteur des risques de perte et de détérioration.</p>

<h3>ARTICLE 15 - RENSEIGNEMENTS – CONTACT – RECLAMATIONS</h3>
<p>Pour tout renseignement, demande d'information ou réclamation, l'Acheteur peut contacter AIRTON selon les modalités suivantes :</p>
<ul>
    <li>Par courrier recommandé avec accusé de réception à l'adresse suivante :255 Boulevard de la Madeleine, 06000 Nice</li>
    <li>Par email à l'adresse : info@airton.shop</li>
</ul>

<h3>ARTICLE 16 - PREUVE</h3>
<p>De convention expresse entre AIRTON et l'Acheteur, les courriers électroniques feront foi entre les Parties, de mêmes que les données enregistrées par les systèmes d'enregistrement automatique utilisés dans des conditions raisonnables de sécurité sur le Site, notamment quant à l'objet et à la date de la commande.</p>

<h3>ARTICLE 17 - DONNEES PERSONNELLES / CONFIDENTIALITE</h3>
<p>AIRTON s'engage à respecter la confidentialité des données personnelles communiquées par l'Acheteur sur le Site et à les traiter dans le respect de la loi Informatique et Libertés n°78-17 du 6 janvier 1978.</p>
<p>Les informations et données à caractère personnel transmises à AIRTON par l'Acheteur font l'objet d'un traitement informatique et pourront être utilisées par AIRTON, ses services internes, ses sous-traitants, ses partenaires commerciaux ou ses ayant-droits pour :</p>
<ul>
    <li>le traitement, l'exécution et la gestion des commandes,</li>
    <li>le traitement des demandes d'information, des réclamations et des rétractations,</li>
    <li>améliorer les services que AIRTON propose à l'Acheteur</li>
</ul>
<p>AIRTON s'engage à ne pas communiquer les informations relatives à l'Acheteur à des tiers autres que ses ayant-droits, ses partenaires commerciaux et ses sous-traitants chargés de la gestion, de l'exécution, du traitement, de la livraison, le paiement et/ou le suivi des commandes.</p>
<p>AIRTON pourra toutefois être amenée à communiquer ces données pour répondre à une injonction des autorités légales.</p>
<p>Conformément aux dispositions de la loi Informatique et Libertés n° 78-17 du 6 janvier 1978, l'Acheteur dispose d'un droit d'accès, de modification, de rectification et de suppression de ses données à caractère personnel.</p>

<h3>ARTICLE 18 - INTEGRALITE</h3>
<p>Dans l'hypothèse où l'une des clauses des Conditions Générales de Vente deviendrait nulle et/ou non avenue en raison d'un changement de législation, de réglementation ou par une décision de justice, les autres clauses n'en seraient pas pour autant annulées.</p>

<h3>ARTICLE 19 - LOI APPLICABLE</h3>
<p>Les Conditions Générales de Vente et de Prestations de Services ainsi que la relation contractuelle conclue entre CAMATEL et l'Acheteur sont soumis par loi Monégasque.</p>
<p>En cas de litige vous devez expédier une lettre recommandée au professionnel pour exposer votre réclamation , il a deux mois pour vous répondre , et sans réponse ou si celle-ci vous convient pas , vous pouvez : Conformément à article L. 612-1 du code de la consommation , en cas de litige, vous avez la possibilité de saisir le Médiateur de la consommation suivant : MCP Médiation 12 square Desnouettes 75015 PARIS par courrier postal ou bien cliquez sur le lien http://mcpmediation.org et remplissez le formulaire de saisine en ligne.</p>

<h3>ARTICLE 20 : Installation et mise en service des climatiseurs par des professionnels agréés</h3>
<p><strong>Obligation d'installation par un professionnel agréé</strong><br>
Dans le cadre de notre déploiement d'Airton en Europe, incluant la Belgique, l'Italie, l'Espagne, les Pays-Bas, l'Allemagne et le Luxembourg, il est impératif que l'installation de nos climatiseurs soit réalisée exclusivement par des professionnels agréés ou frigoristes. Cette exigence garantit la conformité avec les réglementations locales en vigueur, ainsi que la sécurité et la performance optimale de nos produits.</p>
<p><strong>Conditions de mise en service</strong><br>
Les clients sont tenus de respecter les conditions de mise en service des climatiseurs spécifiques à chaque pays concerné. Cela comprend, sans s'y limiter, l'obtention de toutes les autorisations nécessaires, le respect des codes du bâtiment et des normes environnementales, ainsi que le suivi des directives du fabricant.</p>
<p><strong>Responsabilité en cas de non-conformité</strong><br>
Airton décline toute responsabilité en cas de dommages résultant de l'installation ou de la mise en service non conforme de ses climatiseurs. Les clients qui ne respectent pas ces conditions pourraient perdre leur garantie et se voir refuser les services de maintenance ou de réparation.</p>
<p><strong>Preuve de l'installation par un professionnel agréé</strong><br>
Les clients devront fournir une preuve écrite attestant que l'installation a été effectuée par un professionnel agréé ou un frigoriste. Cette preuve peut inclure, sans s'y limiter, une copie de la facture d'installation, un certificat d'achèvement ou tout autre document officiel délivré par le professionnel ayant effectué l'installation.</p>
<p><strong>Recours en cas de problème</strong><br>
En cas de problème lié à l'installation ou à la mise en service du climatiseur, les clients sont invités à contacter Airton pour obtenir de l'aide ou des conseils. Nous nous engageons à travailler en étroite collaboration avec nos clients pour résoudre les problèmes et veiller à ce que nos produits fonctionnent de manière optimale et en toute sécurité.</p>
<p>En acceptant ces conditions générales de vente, les clients s'engagent à respecter les exigences relatives à l'installation et à la mise en service des climatiseurs Airton, ainsi qu'à assumer l'entière responsabilité en cas de non-conformité.</p>
`;

function createPage(filename, rawHtmlContent) {
    const $ = cheerio.load(baseHtmlContent, { decodeEntities: false, recognizeSelfClosing: true });
    
    // Replace main content
    // Find the main element and insert the standard rich text structure
    const newMainContent = `
        <div class="section-breadcrumb page-width page-width--fixed section--padding" style="--section-padding-top: 16px;--section-padding-bottom: 20px;">
            <nav class="breadcrumbs flex items-center justify-start md:justify-start" role="navigation" aria-label="breadcrumbs">
            <a href="../index.html" title="Home" class="reversed-link">Accueil</a><span aria-hidden="true" class="breadcrumbs--sep"></span><span class="breadcrumbs--last text-subtext">Page</span></nav>
        </div>
        <section class="shopify-section section">
            <div class="section section-rich-text section--padding page-width page-width--fixed color-scheme-1" style="--section-padding-top: 60px;--section-padding-bottom: 60px;">
            <div class="rich-text rich-text--standard text-left rte">
                ${rawHtmlContent}
            </div>
            </div>
        </section>
    `;
    
    $('#MainContent').html(newMainContent);
    
    fs.writeFileSync(path.join('./airton.shop/pages', filename), $.html(), 'utf8');
    console.log('Created page:', filename);
}

createPage('politique-de-remboursement.html', refundPolicyText);
createPage('conditions-d-utilisation.html', termsText);

// 2. Add links to footer across all files
function injectFooterLinks(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            injectFooterLinks(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const $ = cheerio.load(content, { decodeEntities: false, recognizeSelfClosing: true });
            
            // Find "Informations" block in footer
            const infoUl = $('h3.footer-block__heading:contains("Informations")').closest('.footer-block').find('ul.accordion-details__content');
            
            if (infoUl.length > 0) {
                // Determine relative path based on directory depth
                const depth = fullPath.split(path.sep).length - 3; // airton.shop is root
                const prefix = depth > 0 ? '../'.repeat(depth) : '';
                
                // Check if already added
                if (infoUl.html().includes('politique-de-remboursement.html')) {
                    continue;
                }

                const newLinks = `
                    <li class="reversed-link">
                        <a href="${prefix}pages/politique-de-remboursement.html" class="text-subtext block">
                        <span class="reversed-link__text">Politique de remboursement</span>
                        </a>
                    </li>
                    <li class="reversed-link">
                        <a href="${prefix}pages/conditions-d-utilisation.html" class="text-subtext block">
                        <span class="reversed-link__text">Conditions d’utilisation</span>
                        </a>
                    </li>
                `;
                
                infoUl.append(newLinks);
                fs.writeFileSync(fullPath, $.html(), 'utf8');
                console.log('Injected footer links into:', fullPath);
            }
        }
    }
}

injectFooterLinks('./airton.shop');
console.log('Done.');
