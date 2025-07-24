# Partie 1: Questions théoriques

## Question 1: Injection SQL
### 1: Expliquer ce qu'est une injection SQL avec un exemple de code vulnérable.
Une injection SQL est une attaque permettant d'injecter sur le serveur et faire executer par celui-ci une requète SQL. Cela est effectué en envoyant au serveur une string fermant la requète actuellen et en écrivant une seconde, qui sera effectuée.

```js
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    db.query(query, (err, results) => {
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    });
});
```
Dans ce cas de figure, le nom d'utilisateur (ou mot de passe) peux être utilisé pour faire une injection.

### 2: Donner un exemple d'exploitation possible et la requête générée.*

En utilisant un nom tel que `something ' OR '1'='1' --`, on peux récupérer la liste de tous les utilisateur, car la requête générée sera `SELECT * FROM users WHERE username = 'something' OR '1'='1' -- AND password = 'anything'` Le "OR 1=1", étant toujours vrais, permettrat de sélectionner tous les utilisateurs. Les "--" en fin d'injection vont commenter le reste de la requète.

### 3: Présenter une méthode de protection contre cette vulnérabilité et un exemple de code corrigé.

Une méthode pour s'en protéger est d'échapper les caractères qui vont pouvoir être utilisés pour faire une injection avant de construire la requète.

Un exemple minimal de cela prendrais cette forme:
```js
app.post('/login', (req, res) => {
    const { username, password } = req.body;
	
	const safeUsername = username.replace(/'/g, "''");
    const safePassword = password.replace(/'/g, "''");

    const query = `SELECT * FROM users WHERE username = '${safeUsername}' AND password = '${safePassword}'`;
    
    db.query(query, (err, results) => {
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    });
});
```

## Question 2: XSS
### 1: Qu'elle est la différfence entre XSS réfléchi et un XSS stocké.

Le réfléchi est directement executé, il est temporaire et doit être initié par l'utilisateur en cliquant sur quelque chose.
Le stocké est similaire, mais le script fut enregistré en BDD, et est donc executable a chaque visite du site.

### 2: Donnez un exemple concret d'injection XSS dans un champ utilisateur.

Dans ce cas de figure:
```js
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    res.send(`<h1>Bienvenue ${username}</h1>`);
});
```
Si l'username est "<script>alert('Something')</script>", le code sera executé, affichant une alerte.

### 3: Quelles protections techniques peut-on mettre en place c$oté back-end et front-end ?

On peux se protéger de ça de façon similaire à l'injection SQL en échappant les caractères permettant de faire des balises:
```js
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, c =>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])
    );
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    res.send(`<h1>Bienvenue ${escapeHtml(username)}</h1>`);
});
```

## Question 3: CSRF
### 1: Décrivez le mécanisme d'une attaque CSRF.

Il s'agit d'effectuer, ou faire effectuer à travers l'utilisateur, une requète malveillante.

### 2: Quelle est la différence entre un token CSRF et un header SameSite ?

Le header vas assurer que les requètes viennent bien de notre propre site, et pas d'un agent incoonu.
Le token sera unique, généré aléatoirement et dépendant de la session de l'utilisateurs. L'attaquant aurais besoin de deviner ce token pour effectuer cette attaque.

### 3: Donnez deux méthodes de protection concrètes.

- Utiliser des tokens CSRF dans les formulaires
- Vérifier l'entête des requètes
- Demander une double authentification pour les requètes dangereuses.

## Question 4: Sécurité de session et accès
### 1: Qu'est-ce qu'un cookie httpOnly et pourquoi est-il important ?

C'est un cookie inaccessible par du JS, assurant qu'il ne puisse pas être manipulé ou forgé lors d'une attaque.

### 2: Expliquez le risque de l'attaque IDOR et comment s'en protéger.

Cette attaque pose des problèmes de confidentialité, et la protection demande d'avoir une bonne protection des différentes routes et pages, en ayant bien préparé et organisé les accès disponibles aux différents utilisateurs. Le tout en n'ayant pas confiances aux informations reçues par le server.

## Question 5: Bonnes pratiques générales 
### 1: Citez trois bonnes pratiques globales de développement sécurisé à appliquer sur une application web.
- Valider et filtrer tout ce qu'on reçois du front.
- Mettre régulièrement à jour les dépendances.
- Limiter la verbosité des messages d'erreurs sur l'environnement live.
### 2: Pour chacune, donnez une justification.
- Il est trop dangereux de ne pas avoir de sécurité en place et de permettre à l'utilisateur d'envoyer des requètes non-filtrès.
- Beaucoup d'attaques peuvent être effectuées car une faille est connue, corrigée sur la dernière version, mais la cible de l'attaque ne dispose pas de celle-ci.
- Détailler une erreure, c'est détailler le problème qui existe, et donc donner des armes et angles d'attaques à un acteur malveillant.