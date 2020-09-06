# TwiNode
Un réseau social similaire à Twitter, utilisant NodeJS, Typescript, Handlebars et Mongodb avec Mongoose.

Pour faire fonctionner le projet, il faut :

1. Ajouter un fichier **.env** à la racine du projet
2. Dans le fichier **.env**, mettre comme les valeurs:
     * **Mail**="adresse mail",
     * **PASS**="mot de passe du mail",
     * **DB**="mongodb://'uri'/'nom de la base de donnée'",
     * **PORT**="numéro port du serveur",
     * **SECRET**="clé jsonwebtoken",
     * **SECRET_KEY**="clé jsonwebtoken".
3. Installer les dépendances avec **npm install**
4. Lancer la commande **npm run watch** pour lancer le projet !
