# Identification des vulnérabilités

## Formulaire de login vulnérable à l'injection SQL.
### Définition du problème
Dans `app.js`
```js
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username == username && u.password == password);
  if (user) {
    req.session.user = user;
    res.redirect('/dashboard');
  } else {
    res.send('Login failed');
  }
});
```
La BDD peux être librement manipulée par quelqu'un effectuant une attaque par cette faille, permettant de voler et/ou détruire de l'information.

### Pourquoi cette faille n'est plus exploitable.

Les entrées utilisateur sont maintenant converties en chaînes et comparées strictement, ce qui empêche toute injection ou manipulation du processus d'authentification.

## Formulaire de contact vulnérable au XSS stocké.
### Définition du problème
Dans `app.js`
```js
app.post('/contact', (req, res) => {
  const { message } = req.body;
  messages.push(message);
  res.redirect('/contact');
});
```
Dans `contact.ejs`
```js
<ul>
  <% messages.forEach(function(msg) { %>
    <li><%= msg %></li>
  <% }) %>
</ul>
```

Le message est directement stocké, avant d'être à nouveau affiché. Cela permet d'inclure du JS dans le message qui sera executé quand le message sera affiché.

### Pourquoi cette faille n'est plus exploitable.

Le message utilisateur est échappé côté serveur avant d'être stocké, empêchant l'injection de JS et donc une attaque XSS.

## Formulaire de modification de profil vulnérable au CSRF.
### Définition du problème
Dans `app.js`
```js
app.post('/edit-profile', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = users.find(u => u.id === req.session.user.id);
  user.username = req.body.username;
  res.redirect('/dashboard');
});
```
Ce formulaire ne disposant pas de token de protection CSRF, permettant à un attaquant de faire envoyer une requète `edit-profile` par un utilisateur sans qu'il en est conscience.

### Pourquoi cette faille n'est plus exploitable.

Un jeton unique est généré et vérifié à chaque soumission du formulaire, empêchant toute requête non autorisée provenant d'un site tiers.

## Accès aux commandes d'un autre utilisateur possible via modification d'ID dans l'URL.
### Définition du problème
Dans `app.js`
```js
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const userId = parseInt(req.query.id || req.session.user.id);
  const user = users.find(u => u.id === userId);
  res.render('dashboard', { user });
});
```
Le dashboard étant affiché par un système d'ID directement dans l'URL, sans vérification supplémentaire de si c'est l'utilisateur avec le même ID qui tente d'accéder à ce dashboard, il est possible à tous les utilisateurs d'accéder à tous les dashboards.

### Pourquoi cette faille n'est plus exploitable.

L'accès au dashboard est maintenant limité à l'utilisateur connecté uniquement, sans possibilité de spécifier un autre identifiant dans l'URL.

## Cookies de session mal configurés
### Définition du problème
Dans `app.js`
```js
app.use(session({
  secret: 'notsecure',
  resave: false,
  saveUninitialized: true
}));
```
Rien n'étant définie, caché ou sécurisé de ce côté là permet à un attaquant de falsifier ou de "voler" des sessions.

### Pourquoi cette faille n'est plus exploitable.

Les cookies de session sont maintenant configurés avec les options httpOnly, sameSite et secure, ce qui empêche leur vol ou leur falsification par un attaquant.