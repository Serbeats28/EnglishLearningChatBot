import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../src/assets/main.css';
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
  faSearch, 
  faRotate, 
  faFolderOpen, 
  faPlus, 
  faPenToSquare, 
  faTrash, 
  faFileImport, 
  faBars, 
  faHome,
  faClock,
  faGear,
  faPaperPlane,
  faUser,
  faUserCheck,
  faCheck,
  faFaceSmile,
  faXmark,
  faEllipsis,
  faExclamationTriangle,
  faExclamationCircle, 
  faCheckCircle, 
  faInfoCircle,
  faMessage
} from '@fortawesome/free-solid-svg-icons';
// Add icons to the library
library.add(faSearch, faRotate, faFolderOpen, faPlus, faPenToSquare, faTrash, faFileImport, 
faBars, faHome, faClock, faGear, faPaperPlane, faUser, faUserCheck, faCheck, faFaceSmile, faXmark, faEllipsis, faExclamationTriangle, faExclamationCircle, faCheckCircle,
faInfoCircle, faMessage);

// Create Vue app
const app = createApp(App);
const pinia = createPinia()
// ✅ Register FontAwesomeIcon globally BEFORE using router or mounting
app.component('FontAwesomeIcon', FontAwesomeIcon);

app.use(pinia).use(router).mount('#app');
