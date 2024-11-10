export class UIComponents {
    static createLoadingIndicator(): HTMLElement {
      const container = document.createElement('div');
      container.style.cssText = `
        position: relative;
        width: 20px;
        height: 20px;
      `;
  
      const spinner = document.createElement('div');
      spinner.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      `;
  
      const keyframes = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
  
      const style = document.createElement('style');
      style.textContent = keyframes;
      document.head.appendChild(style);
  
      container.appendChild(spinner);
      return container;
    }
  }