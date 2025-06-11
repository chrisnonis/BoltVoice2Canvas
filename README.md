# Voice2Canvas - AI Art Generation

Transform your spoken words into beautiful digital art with the power of AI.

🏆 **Bolt Hackathon 2025 Entry** - [Visit Hackathon](https://hackathon.dev/)

## 🌟 Features

- **Voice-to-Art**: Speak your artistic vision and watch AI create it
- **AI Art Consultant**: Get guidance and feedback on your creations
- **Gallery Management**: Save and organize your artworks
- **Community Showcase**: Share and discover art from other users
- **Accessibility First**: Comprehensive accessibility features for all users

## 🚀 Live Demo

Visit the live application: [Voice2Canvas on Netlify](https://nimble-elf-a4ab1b.netlify.app)     https://www.voice2canvas.co.uk/

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Database + Edge Functions)
- **AI Services**: Stability AI for image generation
- **Voice Recognition**: Web Speech API
- **Deployment**: Netlify
- **Version Control**: GitHub

## 📋 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/voice2canvas.git
cd voice2canvas
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Setup

1. Create a new Supabase project
2. Run the migrations in the `supabase/migrations` folder
3. Add your Stability AI API key to Supabase Edge Functions environment variables:
   - Go to your Supabase project dashboard
   - Navigate to **Settings** → **Edge Functions**
   - Add environment variable: `STABILITY_API_KEY` with your API key

### 5. Development

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
```

## 🌐 Deployment

### Automatic Deployment

This project is configured for automatic deployment to Netlify. Every push to the main branch will trigger a new deployment.

**Live URL**: https://nimble-elf-a4ab1b.netlify.app

### Manual Deployment

You can also deploy manually:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your preferred hosting service

## ♿ Accessibility Features

Voice2Canvas is designed to be accessible to everyone:

- **Screen Reader Support**: Complete ARIA labeling and semantic HTML
- **Keyboard Navigation**: Full functionality without mouse
- **Voice Commands**: Control the app using voice alone
- **High Contrast Mode**: Enhanced visibility options
- **Audio Descriptions**: Spoken descriptions of generated artwork

## 🎨 Usage Guide

### Creating Your First Artwork

1. **Start Recording**: Click the microphone button or press Alt+M
2. **Describe Your Vision**: Speak clearly about your artistic idea
3. **Stop Recording**: Press the red stop button when finished
4. **Generate**: Press the green button to create your masterpiece
5. **Save & Share**: Save to your gallery or share with the community

### Best Practices for Voice Prompts

- Be specific and detailed in your descriptions
- Include artistic style preferences (oil painting, impressionist, etc.)
- Describe colors, lighting, and mood
- Mention composition elements
- Use artistic terminology for better results

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Hackathon Information

Voice2Canvas was created for the [Bolt Hackathon 2025](https://hackathon.dev/). While built for the competition, it serves as a real platform for accessible digital art creation.

## 📞 Support

- **Help Center**: [/help](https://nimble-elf-a4ab1b.netlify.app/help)
- **Tutorials**: [/tutorials](https://nimble-elf-a4ab1b.netlify.app/tutorials)
- **Email**: support@voice2canvas.com
- **Accessibility Support**: accessibility@voice2canvas.com

## 🔗 Links

- **Live App**: https://nimble-elf-a4ab1b.netlify.app
- **GitHub**: https://github.com/yourusername/voice2canvas
- **Bolt Hackathon**: https://hackathon.dev/
- **Twitter**: [@xda_remote](https://x.com/xda_remote)
- **LinkedIn**: [Christopher Nonis](https://www.linkedin.com/in/christopher-nonis/)

---

Made with ❤️ for the Bolt Hackathon 2024
