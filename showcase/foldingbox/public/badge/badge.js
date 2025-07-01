(function () {
    const defaultConfig = {
      theme: "light",
      showSecondLink: false,
      secondLinkUrl: "https://github.com/Nodi3d/modular/tree/main/showcase/foldingbox",
      secondIcon: "https://nodi-badge.pages.dev/source.svg",
      logo: "https://nodi-badge.pages.dev/logo.svg",
      linkUrl: "https://nodi3d.com",
    };

    const config = { ...defaultConfig, ...(window.NODI_BADGE_CONFIG || {}) };

    const textColor = config.theme === "light" ? "rgba(0, 0, 0, 0.56)" : "rgba(255, 255, 255, 0.86)";
    const logoColor = config.theme === "light" ? "rgba(0, 0, 0, 0.36)" : "rgba(255, 255, 255, 0.36)";
  
    const container = document.createElement("div");
    container.className = "nodi-badge-wrapper";
    container.innerHTML = `
    ${
      config.showSecondLink
        ? `<a class="nodi-icon-link" href="${config.secondLinkUrl}" target="_blank" rel="noopener noreferrer">
            <span class="nodi-icon-container"></span>
          </a>`
        : ""
    }
      <a class="nodi-main-link" href="${config.linkUrl}" target="_blank" rel="noopener noreferrer">
        <span class="nodi-text">Made with</span>
        <span class="nodi-logo-container"></span>
      </a>
    `;

    // Fetch and inline the logo SVG
    fetch(config.logo)
      .then(response => response.text())
      .then(svgText => {
        const logoContainer = container.querySelector('.nodi-logo-container');
        if (logoContainer) {
          logoContainer.innerHTML = svgText;
          const svg = logoContainer.querySelector('svg');
          if (svg) {
            svg.classList.add('nodi-logo');
          }
        }
      })
      .catch(error => {
        console.warn('Failed to load SVG logo:', error);
        // Fallback to img tag
        const logoContainer = container.querySelector('.nodi-logo-container');
        if (logoContainer) {
          logoContainer.innerHTML = `<img class="nodi-logo" src="${config.logo}" alt="Nodi" />`;
        }
      });

    // Fetch and inline the source icon SVG
    if (config.showSecondLink) {
      fetch(config.secondIcon)
        .then(response => response.text())
        .then(svgText => {
          const iconContainer = container.querySelector('.nodi-icon-container');
          if (iconContainer) {
            iconContainer.innerHTML = svgText;
            const svg = iconContainer.querySelector('svg');
            if (svg) {
              svg.classList.add('nodi-icon');
            }
          }
        })
        .catch(error => {
          console.warn('Failed to load SVG icon:', error);
          // Fallback to img tag
          const iconContainer = container.querySelector('.nodi-icon-container');
          if (iconContainer) {
            iconContainer.innerHTML = `<img class="nodi-icon" src="${config.secondIcon}" alt="Source" />`;
          }
        });
    }
  
    const style = document.createElement("style");
    style.innerHTML = `
      .nodi-badge-wrapper {
        position: fixed;
        bottom: 16px;
        right: 16px;
        display: flex;
        align-items: center;
        flex-direction: row;
        gap: 4px;
        z-index: 9999;
        pointer-events: auto;
        font-family: sans-serif;
      }
  
      .nodi-main-link {
        padding: 4px 8px;
        display: flex;
        align-items: center;
        gap: 4px;
        text-decoration: none;
        color: ${textColor};
        transition: all 0.2s ease-in-out;
        
      }
  
      .nodi-main-link:hover {
        
        opacity: 0.8;
      }
  
      .nodi-text {
        font-size: 14px;
        font-weight: 500;
      }
  
      .nodi-logo-container {
        display: inline-flex;
        align-items: center;
        color: ${logoColor};
      }

      .nodi-logo {
        height: 28px;
        width: auto;
        color: inherit;
      }
  
      .nodi-icon-link {
        padding: 0px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease-in-out;
        color: ${textColor};
        position: relative;
      }

      .nodi-icon-container {
        display: inline-flex;
        align-items: center;
        color: ${logoColor};
      }

      .nodi-icon-link::before {
        content: "view source";
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: ${textColor};
        color: ${config.theme === "light" ? "#fff" : "#000"};
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
        pointer-events: none;
        margin-bottom: 4px;
        z-index: 10000;
      }

      .nodi-icon-link:hover::before {
        opacity: 1;
        visibility: visible;
      }
  
      .nodi-icon-link:hover {
        
        opacity: 0.8;
      }
  
      .nodi-icon {
        width: 24px;
        height: 24px;
        color: inherit;
      }
  
    `;
  
    document.head.appendChild(style);
    document.body.appendChild(container);
  })();