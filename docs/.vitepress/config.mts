import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid({
  title: "Birdhouse",
  description: "API Documentation",
  locales: {
    root: {
      label: "English",
      lang: "en"
    },
    pl: {
      label: "Polski (Polish)",
      lang: "pl",
      themeConfig: {
        nav: [
          { text: 'Strona główna', link: '/pl' },
          { text: 'API HTTP', link: '/pl/api/general.md' },
        ],

        sidebar: [
          {
            text: "Rozpoczęcie pracy",
            items: [
              { text: "Konfiguracja", link: "/pl/setup" },
              { text: "Schemat bazy danych", link: "/pl/database" },
            ]
          },
          {
            text: "API HTTP",
            items: [
              { text: "Wprowadzenie", link: "/pl/api/general.md" },
              { text: "/api/auth", link: "/pl/api/auth.md" },
              { text: "/api/media", link: "/pl/api/media.md" },
              { text: "/api/posts", link: "/pl/api/posts.md" },
              { text: "/api/timeline", link: "/pl/api/timeline.md" },
              { text: "/api/user", link: "/pl/api/user.md" },
            ]
          }
        ]
      }
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'HTTP API', link: '/api/general.md' },
    ],
    
    sidebar: [
      {
        text: "Getting started",
        items: [
          { text: "Setup", link: "/setup" },
          { text: "Database Schema", link: "/database" },
        ]
      },
      {
        text: "HTTP API",
        items: [
          { text: "Introduction", link: "/api/general.md" },
          { text: "/api/auth", link: "/api/auth.md" },
          { text: "/api/media", link: "/api/media.md" },
          { text: "/api/posts", link: "/api/posts.md" },
          { text: "/api/timeline", link: "/api/timeline.md" },
          { text: "/api/user", link: "/api/user.md" },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ascpixi/birdhouse' }
    ],

    logo: "/resources/icon.svg"
  }
})
