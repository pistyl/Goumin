#!/bin/bash
echo "==================================================="
echo "  Goumin : Nettoyage et Initialisation Git Propre (Git Bash)"
echo "==================================================="
echo ""

echo "1. Suppression de l'ancienne configuration Git (.git)..."
if [ -d ".git" ]; then
    rm -rf .git
    echo "   Dossier .git supprime."
else
    echo "   Aucun dossier .git trouve."
fi

echo ""
echo "2. Initialisation du nouveau depot Git (git init)..."
git init
if [ $? -ne 0 ]; then
    echo "[ERREUR] Impossible d'initialiser Git."
    exit 1
fi

# Forcer le nom de la branche principale a master
git branch -M master

echo ""
echo "3. Liaison avec le depot GitHub distant (https://github.com/pistyl/Goumin)..."
git remote add origin https://github.com/pistyl/Goumin.git

echo ""
echo "4. Indexation propre des fichiers (git add)..."
echo "   (node_modules, .next et .env seront ignores grace au .gitignore)"
git add .
if [ $? -ne 0 ]; then
    echo "[ERREUR] Echec lors de l'indexation."
    exit 1
fi

echo ""
echo "5. Creation du premier commit propre (git commit)..."
git commit -m "feat: design moderne avec icones vectorielles SVG, wizard onboarding et stabilite BDD"
if [ $? -ne 0 ]; then
    echo "[ERREUR] Echec du commit."
    exit 1
fi

echo ""
echo "6. Envoi force vers GitHub (git push)..."
echo "   (Cela ecrasera proprement le depot en ligne)"
git push -u -f origin master
if [ $? -ne 0 ]; then
    echo ""
    echo "[ERREUR] Echec du push. Verifie ta connexion internet ou tes droits d'ecriture sur le depot."
    exit 1
fi

echo ""
echo "==================================================="
echo "  [SUCCES] Ton code propre a ete pousse sur GitHub ! 🚀"
echo "  Depot : https://github.com/pistyl/Goumin (branche master)"
echo "==================================================="
read -p "Appuie sur Entree pour fermer..."
