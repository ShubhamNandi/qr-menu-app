# QR Menu App

A modern, responsive digital menu application built with React, Vite, and Tailwind CSS. Perfect for restaurants and cafes looking to provide a digital menu experience through QR codes.

## Features

- 🍽️ **Modern Menu Display** - Clean, card-based layout for menu items
- 🛒 **Shopping Cart** - Add/remove items with real-time total calculation
- 📱 **Responsive Design** - Works perfectly on all device sizes
- 🎨 **Modern UI/UX** - Clean white, black, and grey color scheme
- ⚡ **Fast Performance** - Built with Vite for lightning-fast development and builds
- 🎯 **Tab Navigation** - Easy switching between menu and cart views

## Tech Stack

- **React 19** - Latest React with modern hooks and features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **PostCSS** - CSS processing with autoprefixer

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd qr-menu-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
qr-menu-app/
├── src/
│   ├── App.jsx          # Main application component
│   ├── index.css        # Tailwind CSS and custom styles
│   └── main.jsx         # Application entry point
├── public/              # Static assets
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── vite.config.js       # Vite configuration
└── package.json         # Project dependencies and scripts
```

## Customization

### Adding Menu Items

Edit the `menuItems` array in `src/App.jsx` to add, remove, or modify menu items:

```javascript
const menuItems = [
  {
    id: 1,
    name: 'Your Item Name',
    description: 'Item description',
    price: 19.99,
    category: 'Category',
    image: '🍕' // Emoji or image URL
  }
  // ... more items
]
```

### Styling

The app uses Tailwind CSS with a custom color scheme. You can modify colors in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Your custom colors
  },
  accent: {
    // Your custom colors
  }
}
```

### Custom CSS Classes

Custom component classes are defined in `src/index.css`:

- `.btn-primary` - Primary button styling
- `.btn-secondary` - Secondary button styling
- `.card` - Card component styling

## Features to Add

- [ ] User authentication
- [ ] Order management system
- [ ] Payment integration
- [ ] Menu categories and filtering
- [ ] Search functionality
- [ ] Admin panel for menu management
- [ ] Real-time order updates
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@qrmenuapp.com or create an issue in the repository.

---

Built with ❤️ using React, Vite, and Tailwind CSS
