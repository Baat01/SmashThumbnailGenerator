# Smash Thumbnail Generator

Bienvenue sur le **Smash Thumbnail Generator**, une application web qui vous permet de générer automatiquement des miniatures (thumbnails) pour vos matchs de Super Smash Bros. (ou autres jeux) en récupérant directement les données depuis l'API de **start.gg**.

L'application utilise un système de template personnalisable (via Fabric.js) et génère le rendu des personnages, des pseudos, et des phases de jeu automatiquement.

---

## 🚀 Comment utiliser l'application

Le processus de génération de miniatures se déroule en 4 étapes simples :

### Étape 1 : Authentification (Clé d'API start.gg)
Pour récupérer les données de vos tournois, l'application a besoin d'une clé d'API start.gg.
1. Connectez-vous à votre compte sur [start.gg](https://start.gg).
2. Allez dans les paramètres de votre compte, section **Developer Settings**.
3. Générez un nouveau "Personal Access Token".
4. Copiez ce token et collez-le dans le champ prévu à cet effet sur la page d'accueil de l'application.
*(Note : Votre clé est sauvegardée localement dans votre navigateur pour vos prochaines visites).*

### Étape 2 : Sélection du Tournoi
1. Entrez l'URL du tournoi start.gg (ex: `https://start.gg/tournament/mon-super-tournoi/details`) ou simplement le "slug" du tournoi (ex: `mon-super-tournoi`).
2. Cliquez sur "Rechercher". L'application va récupérer les informations.
3. Une fois le tournoi trouvé, sélectionnez l'événement spécifique (ex: "Super Smash Bros. Ultimate Singles") pour lequel vous souhaitez générer les miniatures.

### Étape 3 : Sélection des Sets (Matchs)
1. L'application affichera la liste des matchs (Sets) complétés ou en cours pour l'événement sélectionné.
2. Pour chaque match, vous verrez les joueurs qui s'affrontent et la phase du tournoi (ex: "Winners Final").
3. Si un joueur n'a pas sélectionné son personnage sur start.gg, vous pouvez **cliquer sur le bouton "+"** à côté de son pseudo pour choisir son personnage manuellement.
4. **Cochez les cases** à gauche des matchs pour lesquels vous souhaitez générer une miniature, ou utilisez le bouton "Tout sélectionner".
5. Cliquez sur "Passer à la génération".

### Étape 4 : Génération et Export
L'application utilise un template par défaut pour placer les personnages, les pseudos, et le texte "VS" de façon dynamique.

- **Prévisualisation** : Vous pouvez voir le rendu en direct sur le canvas.
- **Export** : Cliquez sur le bouton d'export pour générer et télécharger l'image ou les images finales (sous forme d'archive si vous avez sélectionné plusieurs matchs).

---

## 🎨 Personnalisation (Templates)

L'application est configurée avec un template par défaut inclus. Cependant, vous pouvez importer vos propres fichiers de configuration JSON si vous souhaitez personnaliser :
- Les arrière-plans (backgrounds).
- La position et la police des textes.
- Le placement et l'échelle des personnages.

Lorsqu'un template valide est importé, l'application ajustera automatiquement le rendu des futures générations en conséquence.

---

## 🛠️ Installation en local (Développement)

Si vous souhaitez exécuter l'application sur votre propre machine :

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement local
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.
