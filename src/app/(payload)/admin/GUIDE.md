# 🎨 Guide de démarrage - Thème EY

## ✅ Installation complète

Ton thème EY est maintenant installé et configuré ! Voici comment l'utiliser et le personnaliser.

## 🚀 Tester le thème

### 1. Démarrer le serveur de développement

```bash
pnpm dev
```

### 2. Accéder à l'admin Payload

Ouvre ton navigateur et va sur : `http://localhost:3000/admin`

### 3. Se connecter

Connecte-toi avec tes identifiants et tu verras le thème EY appliqué 🎉

## 🎨 Personnalisation rapide

### Modifier les couleurs principales

Édite `/src/app/(payload)/admin/custom.scss` et modifie les variables dans `:root` :

```css
:root {
  /* Change le bleu principal EY */
  --theme-bg: #1a2557; /* Bleu foncé */

  /* Change le jaune/doré EY */
  --theme-success-500: #e6a83d; /* Couleur des boutons */

  /* Change le texte principal */
  --theme-text: #333539; /* Gris foncé */
}
```

### Exemples de personnalisation

#### 1. Changer la couleur du header

```css
.template-default #nav {
  background-color: #VOTRE_COULEUR !important;
}
```

#### 2. Modifier la couleur des boutons primaires

```css
.btn,
.btn--style-primary {
  background-color: #VOTRE_COULEUR !important;
}
```

#### 3. Personnaliser les bordures arrondies

```css
.btn,
.card,
input {
  border-radius: 1rem; /* Augmente pour plus d'arrondi */
}
```

## 📋 Variables CSS importantes

### Couleurs de base

| Variable                | Usage                | Valeur par défaut |
| ----------------------- | -------------------- | ----------------- |
| `--theme-bg`            | Fond principal       | `#1A2557`         |
| `--theme-success-500`   | Boutons, accents     | `#E6A83D`         |
| `--theme-text`          | Texte principal      | `#333539`         |
| `--theme-text-inverted` | Texte sur fond foncé | `#FFFFFF`         |

### Élévations (fonds)

| Variable                | Usage           | Valeur    |
| ----------------------- | --------------- | --------- |
| `--theme-elevation-0`   | Plus foncé      | `#1A2557` |
| `--theme-elevation-300` | Blanc           | `#FFFFFF` |
| `--theme-elevation-700` | Gris très clair | `#F7F7F7` |

### États

| Variable              | Usage          | Valeur    |
| --------------------- | -------------- | --------- |
| `--theme-error-500`   | Erreurs        | `#EF5B5B` |
| `--theme-warning-500` | Avertissements | `#FFB833` |
| `--theme-info-500`    | Informations   | `#1A2557` |

## 🔧 Modifications avancées

### Ajouter une police personnalisée

1. Télécharge ta police et place-la dans `/public/fonts/`
2. Ajoute le `@font-face` dans `custom.scss` :

```css
@font-face {
  font-family: 'MaPolice';
  src: url('/fonts/ma-police.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}

body {
  font-family: 'MaPolice', sans-serif;
}
```

### Personnaliser la scrollbar

```css
::-webkit-scrollbar {
  width: 0.75rem; /* Largeur */
}

::-webkit-scrollbar-thumb {
  background-color: #e6a83d; /* Couleur EY */
  border-radius: 0.375rem;
}
```

### Ajouter des animations personnalisées

```css
@keyframes monAnimation {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.mon-element {
  animation: monAnimation 0.3s ease;
}
```

## 🎯 Cas d'usage courants

### 1. Thème plus sombre

```css
:root {
  --theme-elevation-0: #0f1635;
  --theme-elevation-50: #1a2557;
  --theme-bg: #0f1635;
}
```

### 2. Tons plus clairs

```css
:root {
  --theme-elevation-0: #f5f5f5;
  --theme-elevation-50: #ffffff;
  --theme-bg: #fafafa;
}
```

### 3. Accents colorés différents

```css
:root {
  --theme-success-500: #00b8d4; /* Cyan */
  --theme-info-500: #7c4dff; /* Violet */
}
```

## 📱 Responsive personnalisé

Ajoute des styles responsives pour différentes tailles d'écran :

```css
/* Mobile */
@media (max-width: 768px) {
  .btn {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .dashboard__main {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .collection-list table {
    font-size: 1rem;
  }
}
```

## 🐛 Dépannage

### Le thème ne s'applique pas

1. Vérifie que le serveur de développement est redémarré :

   ```bash
   pnpm dev
   ```

2. Vide le cache du navigateur (Cmd+Shift+R sur Mac, Ctrl+Shift+R sur Windows)

3. Vérifie que le chemin dans `payload.config.ts` est correct :
   ```typescript
   css: path.resolve(dirname, './app/(payload)/admin/custom.scss'),
   ```

### Certains styles ne fonctionnent pas

- Ajoute `!important` pour forcer le style :
  ```css
  .mon-element {
    color: #e6a83d !important;
  }
  ```

### Le fichier SCSS ne compile pas

- Vérifie qu'il n'y a pas d'erreurs de syntaxe CSS
- Assure-toi que tous les accolades sont fermées `{}`
- Vérifie les point-virgules `;` à la fin des lignes

## 📚 Ressources

- [Documentation Payload Admin](https://payloadcms.com/docs/admin/overview)
- [Personnalisation CSS Payload](https://payloadcms.com/docs/admin/customizing-css)
- [Variables CSS (MDN)](https://developer.mozilla.org/fr/docs/Web/CSS/Using_CSS_custom_properties)

## 💡 Conseils

1. **Teste toujours** : Après chaque modification, vérifie dans plusieurs pages de l'admin
2. **Utilise les variables** : Préfère modifier les variables CSS plutôt que les styles directs
3. **Garde une cohérence** : Utilise les mêmes espacements et border-radius partout
4. **Pense responsive** : Teste sur mobile, tablette et desktop
5. **Documente tes changes** : Ajoute des commentaires dans le CSS pour les futures modifications

## 🎉 Prochaines étapes

1. Personnalise les couleurs selon tes besoins
2. Ajoute ta propre police si nécessaire
3. Teste sur différents écrans
4. Partage le thème avec ton équipe !

---

**Besoin d'aide ?** Consulte le fichier `README.md` dans le même dossier pour plus de détails techniques.
