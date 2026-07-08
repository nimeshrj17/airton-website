import os

base_dir = '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro'

# 1. Update the images in the collection page
col_file = os.path.join(base_dir, 'airton.shop/collections/climatiseurs-mobiles.html')
if os.path.exists(col_file):
    with open(col_file, 'r', encoding='utf-8') as f:
        col_html = f.read()
    
    # Replace the bundle images with the mobile AC images
    col_html = col_html.replace('409612_airton_120x@2x.avif', 'clim-mobile-409612-mise-en-situation_120x@2x.avif')
    col_html = col_html.replace('airton-clim-reversible-monosplit-smaller.webp', 'clim-mobile-409612-mise-en-situation_120x@2x.avif')
    
    with open(col_file, 'w', encoding='utf-8') as f:
        f.write(col_html)

# 2. Update the window.airtonCurrentProduct in the product pages
product_files = [
    'airton.shop/products/climatiseur-mobile-reversible-3500w-2500w-12000btu.html',
    'airton.shop/products/climatiseur-mobile-reversible-2000w-1700w-7000btu.html',
    'airton.shop/products/climatiseur-mobile-reversible-2600w-2000w-9000btu.html'
]

for p in product_files:
    p_path = os.path.join(base_dir, p)
    if os.path.exists(p_path):
        with open(p_path, 'r', encoding='utf-8') as f:
            p_html = f.read()
        
        # Replace image in window.airtonCurrentProduct
        p_html = p_html.replace('409612_airton_120x@2x.avif', 'clim-mobile-409612-mise-en-situation_120x@2x.avif')
        # Replace Groupe3130/Groupe3129 with the mobile image in the gallery JSON and HTML
        p_html = p_html.replace('Groupe3130.png', 'clim-mobile-409612-mise-en-situation_120x@2x.avif')
        p_html = p_html.replace('Groupe3129.png', 'clim-mobile-409612-mise-en-situation_120x@2x.avif')
        
        with open(p_path, 'w', encoding='utf-8') as f:
            f.write(p_html)

print("Images fixed!")
