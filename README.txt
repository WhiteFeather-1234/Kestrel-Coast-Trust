KESTREL COAST TRUST - starter website (imaginary company)

Open index.html, or upload the whole folder to any web host.

STRUCTURE
 css/style.css   all styling (colours are variables at the top)
 js/app.js       shared header, footer, data and page renderers
 js/admin.js     admin dashboard (open admin.html, demo password: admin123)
 images/gallery/ put your photos here, then add them in Admin > Gallery
                 using the path, e.g. images/gallery/beach1.jpg
 files/          put PDFs here, then add them in Admin > Downloads

ADD A PAGE
 Easy: Admin > Pages > New page, then add "page.html?p=name|Label" under Settings > menu.
 Dedicated file: copy privacy.html, set data-slug, add its content in Admin > Pages.

ADD A FEATURE
 Add a function to the R object in js/app.js, create an HTML page with
 data-page="yourname", and add a section to S in js/admin.js.

IMPORTANT
 Admin edits are saved in the browser you use. They do not update the site for other
 visitors. For a live multi-user site, replace DB.get/DB.set in app.js with calls to a
 server or CMS (login and saving must run on the server). Page/blog content in
 DEFAULTS in app.js is what visitors see until then.
