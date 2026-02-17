# Thème EY - Payload Admin

Ce dossier contient le thème personnalisé inspiré du site EY pour l'interface d'administration Payload.

## 🎨 Palette de couleurs

### Couleurs principales

- **Bleu foncé** (`#1A2557`) : Couleur principale de la marque EY, utilisée pour le header et les éléments importants
- **Jaune/Doré** (`#E6A83D`) : Couleur d'accent pour les boutons primaires et les éléments interactifs
- **Gris anthracite** (`#333539`) : Utilisé pour le texte principal et certains éléments UI
- **Blanc** (`#FFFFFF`) : Fond principal de l'interface

### Couleurs secondaires

- Gris clair : `#F2F2F2`, `#F5F5F5`
- Bordures : `#D6D7D7`
- Success : `#E6A83D` (jaune EY)
- Error : `#EF5B5B`
- Warning : `#FFB833`
- Info : `#1A2557` (bleu EY)

## 📝 Typographie

- **Font principale** : 'Codec Cold' (300, 400, 600, 700, 800)
- **Fallback** : -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif

## 🔧 Configuration

Le thème est automatiquement chargé via la configuration dans `src/payload.config.ts` :

```typescript
admin: {
  css: path.resolve(dirname, './app/(payload)/admin/custom.scss'),
  // ...
}
```

## 📦 Fichiers

- `custom.scss` : Fichier principal du thème contenant toutes les variables CSS et styles personnalisés

## 🎯 Composants stylisés

### Header/Navigation

- Fond gris anthracite (`#333539`)
- Bordure inférieure jaune EY (`#E6A83D`)
- Items de navigation en blanc avec hover jaune

### Boutons

- **Primaire** : Fond jaune EY avec texte bleu foncé
- **Secondaire** : Bordure jaune avec fond transparent
- **Danger** : Rouge d'erreur

### Tables

- Header bleu foncé EY
- Hover avec fond jaune clair
- Bordures arrondies

### Cards

- Fond blanc avec bordure subtile
- Box shadow au hover
- Border radius à 0.5rem

### Inputs

- Bordure grise par défaut
- Focus avec bordure jaune et ombre subtile
- Border radius à 0.375rem

### Notifications

- Success : Fond jaune clair avec bordure jaune
- Error : Fond rouge clair avec bordure rouge
- Warning : Fond orange clair avec bordure orange
- Info : Fond bleu clair avec bordure bleue

## 🎨 Variables CSS principales

```css
--theme-bg: #1a2557 /* Bleu foncé EY */ --theme-success-500: #e6a83d /* Jaune/Doré EY */
  --theme-text: #333539 /* Texte principal */ --theme-text-inverted: #ffffff
  /* Texte sur fond foncé */ --theme-elevation-border-color: #d6d7d7 /* Bordures */;
```

## 🔄 Modifications

Pour personnaliser davantage le thème :

1. Modifier les variables CSS dans `:root` dans `custom.scss`
2. Ajouter des règles spécifiques pour des composants personnalisés
3. Le thème sera automatiquement rechargé en mode développement

## 📱 Responsive

Le thème est entièrement responsive avec des breakpoints adaptés :

- Mobile : < 768px
- Tablet : 768px - 1024px
- Desktop : > 1024px

## 🌗 Mode sombre

Un override pour le mode sombre est disponible avec `[data-theme='dark']` mais peut être personnalisé davantage selon les besoins.

## 🚀 Développement

Pour voir les changements en direct :

```bash
pnpm dev
```

Les modifications du fichier SCSS seront automatiquement rechargées.

## 📚 Ressources

- [Documentation Payload Admin Theme](https://payloadcms.com/docs/admin/customizing-css)
- [Site EY](https://EY.edu)

## ✨ Crédits

Thème inspiré du design system de EY.
