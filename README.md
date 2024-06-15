# AI-Chatbot Mini Projet

## Membres
1) Tuan Linh Dao
2) TRINH Thi Thanh Thuy

## A propos du chatbot
Notre chatbot peut faire 4 fonctions, vous pouvez choisir la fonction souhaitée
en cliquant sur le rectangle à côté de l'espace où vous entrez votre prompt
![alt text](image-1.png)
1) Répondre aux prompts de texte normal, vous pouvez poser vos questions à lui.
2) Génération des images en utilisant le modèle "Dall E" développé par OpenAI.
   Ici le prompt transféré vers le moteur d'IA commence par "/image......."
3) Génération des images en utilisant le modèle [stable-diffusion-v1-4](https://huggingface.co/CompVis/stable-diffusion-v1-4) développé par Robin Rombach, Patrick Esser
   Ici le prompt transféré vers le moteur d'IA commence par "/stable-diffusion......"
4) Générer la réponse vocale
   Ici le prompt transféré vers le moteur d'IA commence par "/speech......"

## Lés clés API dans ce projet
### Les clés API utilisés
Dans ce projet nous avons utilisé deux clés API pour générer les images:
1) La clé API d'OpenAI founie par M.Michel Buffa et M.Michel Winter
2) La clé API pour le modèle [stable-diffusion-v1-4](https://huggingface.co/CompVis/stable-diffusion-v1-4) 

### Comment récupérer la clé API pour le modèle stable-diffusion-v1-4
Pour avoir cette clé, vous pouvez suivre les étapes suivantes:
1) Créez votre compte sur le site du [Hugging Face](https://huggingface.co/)
2) Créez votre clé API par le lien https://huggingface.co/settings/tokens comme l'image ci-dessous
![alt text](image.png) 

## Tester le projet
Pour tester notre projet, vous pouvez suivre les étapes suivantes:
1) Clonez notre projet par la commande 
```ruby
git clone https://github.com/Linhkobe/AI-Chatbot.git
```
2) Mettez en place les clés API dans votre environnement:
Premièrement, mettez dans le répertoire "server" du projet par la commande
```ruby
cd server
```
Après, vous faites la commande pour ouvrir le fichier .bashrc
```ruby
code ~/.bashrc 
``` 
Vous mettez les clés API correspondants comme ci-dessous, et puis vous sauvegardez ce fichier par crtl+S
```ruby
export OPENAI_API_KEY="VOTRE_OPEN_API_KEY"
export HUGGING_FACE_API_KEY="VOTRE_HUGGING_FACE_API_KEY"
```
et puis sauvegardez ces clés par la commande
```ruby
source bashrc
```
3) Démarrer le server: 
Mettez dans le répertoire "server" du projet par la commande
```ruby
cd server
```
et puis les deux commandes ci-dessous respectivement
```ruby
npm install
```

```ruby
npm start
```
4) Démarrer l'interface du chatbot
- Installez l'extension Live Server si vous en n'avez pas.
- Cliquez "Go live" et l'interface va être ouverte automatiquement dans votre navigateur.

## Démonstration du chatbot
- Vous pouvez regarder la vidéo suivante pour la démo:
https://www.youtube.com/watch?v=iSgwS_wpUEk 



