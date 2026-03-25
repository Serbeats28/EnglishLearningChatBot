
import ApiRequest from "./ApiConfig"
import { icon } from '@fortawesome/fontawesome-svg-core'

export function showWaitBox (str) {
    let container = document.getElementById("container-waitbox");
    if (!container) {
        container = document.createElement("div");
        container.id = "container-waitbox";
        container.setAttribute("aria-live", "polite");
        document.body.appendChild(container);
    }
    container.className = "app-waitbox-overlay";
    container.style.display = "grid";
    container.style.placeItems = "center";
    container.style.inset = "0";
    container.style.position = "fixed";

    container.style.display = "grid";

    let waitbox = document.getElementById("waitbox");
    if (waitbox) {
        waitbox.className = "app-waitbox-card";
        const textLoading = document.getElementById("waitbox-text")
        if (textLoading) textLoading.innerHTML = str || "Loading..."
        return;
    }

    waitbox = document.createElement("div");
    waitbox.id = "waitbox";
    waitbox.className = "app-waitbox-card";

    let loadingContent = document.createElement("div");
    loadingContent.id = "waitbox-content";
    loadingContent.className = "app-waitbox-content";

    let spinner = document.createElement("div")
    spinner.className = "app-waitbox-spinner"
    spinner.setAttribute("role", "status")

    const dot1 = document.createElement("span")
    const dot2 = document.createElement("span")
    const dot3 = document.createElement("span")
    dot1.className = "app-waitbox-dot"
    dot2.className = "app-waitbox-dot"
    dot3.className = "app-waitbox-dot"
    spinner.append(dot1, dot2, dot3)

    let heading = document.createElement("div")
    heading.className = "app-waitbox-title"
    heading.innerHTML = "Please wait"

    let textLoading = document.createElement("div");
    textLoading.id = "waitbox-text";
    textLoading.className = "app-waitbox-text";
    textLoading.innerHTML = str || "Loading...";

    let glowBar = document.createElement("div")
    glowBar.className = "app-waitbox-progress"

    loadingContent.appendChild(spinner);
    loadingContent.appendChild(heading);
    loadingContent.appendChild(textLoading);
    loadingContent.appendChild(glowBar);

    waitbox.appendChild(loadingContent);
    container.appendChild(waitbox);
}

export function closeWaitBox () {
    const container = document.getElementById("container-waitbox");
    if (container) {
        const textNode = document.querySelector("#waitbox-text")
        if (textNode) textNode.innerHTML = ""
        container.style.display = "none"
    }
}

/*** CONFIRMATION MODAL ***/
export function confirmationMessage(message, fYes, fNo) {
  if (document.getElementById('confirmbox')) return;

  const overlay = document.createElement('div')
  overlay.id = 'confirmbox'
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background-color: rgba(8, 23, 33, 0.62); backdrop-filter: blur(2px);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; padding: 16px;
  `;

  const box = document.createElement('div')
  box.style.cssText = `
    width: min(92vw, 420px); padding: 18px 16px 14px;
    background-color: #ffffff; color: #123148; font-size: 15px;
    border-radius: 14px; text-align: center; position: relative;
    box-shadow: 0 22px 40px rgba(0, 0, 0, 0.28);
    animation: confirmPop 0.3s ease-out;
  `;

  const topBar = document.createElement('div')
  topBar.style.cssText = `
    background: linear-gradient(90deg, #e2c85f 0%, #f0d669 100%);
    height: 5px; width: 100%; position: absolute; top: 0; left: 0;
    border-top-left-radius: 14px; border-top-right-radius: 14px;
  `;

  const iconContainer = document.createElement('div')
  iconContainer.style.cssText = `
    width: 52px; height: 52px; margin: 8px auto 10px;
    border-radius: 999px; display: flex; align-items: center;
    justify-content: center; color: #8c6800; font-size: 24px;
    background: linear-gradient(145deg, #fff7d1 0%, #ffe89b 100%);
  `;

  // Inject FontAwesome SVG
  const triangleIcon = icon({ prefix: 'fas', iconName: 'exclamation-triangle' })
  iconContainer.innerHTML = triangleIcon.html[0]

  const title = document.createElement('h4')
  title.innerText = 'Please Confirm'
  title.style.cssText = 'margin: 0 0 8px; font-size: 1.2rem; font-weight: 800; color: #123148;';

  const text = document.createElement('div')
  text.textContent = message || 'Are you sure you want to continue?'
  text.style.cssText = 'margin: 0 0 18px; font-size: 15px; line-height: 1.45; color: #3d5668;';

  const buttonContainer = document.createElement('div')
  buttonContainer.style.cssText = 'display: flex; justify-content: space-between; gap: 10px;';

  const okButton = document.createElement('button')
  okButton.innerText = 'Confirm'
  okButton.style.cssText = `
    flex: 1; height: 40px; border: none; border-radius: 8px;
    background: linear-gradient(135deg, #045a8d 0%, #1e9ad1 100%);
    color: white; font-weight: 700; cursor: pointer;
  `;
  okButton.onclick = () => { overlay.remove(); if(typeof fYes == 'function') fYes(); }

  const cancelButton = document.createElement('button')
  cancelButton.innerText = 'Cancel'
  cancelButton.style.cssText = `
    flex: 1; height: 40px; border: 1px solid #c7d8e4; border-radius: 8px;
    background-color: #eef4f8; color: #294457; font-weight: 700; cursor: pointer;
  `;
  cancelButton.onclick = () => { overlay.remove(); if(typeof fNo == 'function') fNo(); }

  buttonContainer.append(cancelButton, okButton)
  box.append(topBar, iconContainer, title, text, buttonContainer)
  overlay.appendChild(box)
  document.body.appendChild(overlay)

  overlay.addEventListener('click', (e) => { if(e.target === overlay) { overlay.remove(); if(typeof fNo == 'function') fNo(); }})
}

/*** SYSTEM NOTIFICATION ***/
export function systemMessage(message, type = 'error', durationToShow = 2200, data = []) {
  const existing = document.querySelector("#system-message-container")
  if(existing) existing.remove()

  const typeStyle = {
    error: { iconName: "exclamation-circle", title: "Action Required" },
    success: { iconName: "check-circle", title: "Success" },
    info: { iconName: "info-circle", title: "Notice" }
  }
  const resolvedType = typeStyle[type] ? type : 'error'
  const currentType = typeStyle[resolvedType]

  const container = document.createElement('div')
  container.id = 'system-message-container'
  container.className = 'floating-system-message-container'

  const alertBox = document.createElement('div')
  alertBox.className = `floating-system-message floating-system-message--${resolvedType}`
  alertBox.role = 'alert'

  const iconContainer = document.createElement('div')
  iconContainer.className = 'floating-system-message-icon'
  
  // Inject FontAwesome SVG based on type
  const renderedIcon = icon({ prefix: 'fas', iconName: currentType.iconName })
  iconContainer.innerHTML = renderedIcon.html[0]

  const content = document.createElement('div')
  content.className = 'floating-system-message-content'

  const title = document.createElement('p')
  title.className = 'floating-system-message-title'
  title.textContent = currentType.title
  
  const text = document.createElement('p')
  text.className = 'floating-system-message-text'
  text.textContent = message || ''
  
  content.append(title, text)

  if (Array.isArray(data) && data.length > 0) {
    const ul = document.createElement('ul')
    ul.className = 'floating-system-message-list'
    data.forEach(item => {
      const li = document.createElement('li'); li.textContent = item; ul.appendChild(li);
    })
    content.appendChild(ul)
  }

  const progress = document.createElement('div')
  progress.className = 'floating-system-message-progress'
  progress.style.animationDuration = `${durationToShow}ms`

  alertBox.append(iconContainer, content, progress)
  container.appendChild(alertBox)
  document.body.appendChild(container)

  setTimeout(() => {
    alertBox.style.opacity = "1"
    alertBox.style.transform = "translateY(0)"
  }, 50)

  setTimeout(() => {
    alertBox.style.opacity = "0"
    alertBox.style.transform = "translateY(-20px)"
    setTimeout(() => container.remove(), 400)
  }, durationToShow)
}

export async function appDefaultThemeConfiguration() {
	try {
    const userCreds = JSON.parse(localStorage.getItem('userCreds')) || ''
    const uuid = userCreds ? userCreds.unique_uid : ''
		const response = await ApiRequest(`/get_default_theme?uuid=${uuid}`)
		return response?.data?.settings?.description || 'System'
	} 
	catch (err) {
		systemMessage(err.message, 'error')
	}
}

export async function AppChatBot(messages, token) {
    try {
      const userCreds = JSON.parse(localStorage.getItem('userCreds')) || undefined
      const payload = {
        uuid: userCreds ? userCreds.unique_uid : '',
        token: token,
        context: messages
      }
      const response = await ApiRequest.post('/chat', payload)
      return response?.data
    } 
    catch (err) {
        systemMessage(err.message, 'error')
    }
}

export function startGoogleAuth(flow = 'signin') {
  const mode = flow === 'signup' ? 'signup' : 'signin'
  const url = `/api/auth/google?flow=${encodeURIComponent(mode)}`
  window.location.assign(url)
}
