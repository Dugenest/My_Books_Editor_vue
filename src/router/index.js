import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import AuthService from '@/services/AuthService';

// Garde de route pour les pages nécessitant une authentification
const requireAuth = (to, from, next) => {
  console.log(
    "Vérification de l'authentification:",
    AuthService.isAuthenticated()
  );

  if (!AuthService.isAuthenticated()) {
    console.log('Non authentifié, redirection vers login');
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    });
  } else {
    console.log('Utilisateur authentifié, accès autorisé');
    next();
  }
};

// Garde de route pour les pages nécessitant un rôle administrateur
const requireAdmin = (to, from, next) => {
  const currentUser = AuthService.getCurrentUser();

  console.log('Vérification des permissions admin:', {
    isAuthenticated: AuthService.isAuthenticated(),
    user: currentUser,
    role: currentUser ? currentUser.role : 'aucun',
  });

  if (!AuthService.isAuthenticated()) {
    console.log('Non authentifié, redirection vers login');
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    });
  } else if (currentUser && currentUser.role === 'ADMIN') {
    console.log('Utilisateur ADMIN, accès autorisé');
    next();
  } else {
    console.log('Accès refusé, redirection');
    next({ name: 'AccessDenied' });
  }
};

// Garde de route pour les pages accessibles uniquement aux utilisateurs non connectés
const requireGuest = (to, from, next) => {
  console.log('Vérification du statut guest:', !AuthService.isAuthenticated());

  if (AuthService.isAuthenticated()) {
    console.log("Déjà authentifié, redirection vers l'accueil");
    next({ name: 'Home' });
  } else {
    console.log('Non authentifié, accès autorisé');
    next();
  }
};

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'Accueil | MyBooks' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/UserProfile.vue'),
    beforeEnter: requireAuth,
    meta: {
      title: 'Mon profil | MyBooks',
      requiresAuth: true,
    },
  },
  // Ajout de la page d'accès refusé
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: () => import('@/views/AccessDeniedView.vue'),
    meta: { title: 'Accès refusé | MyBooks' },
  },
  // Ajout de la route pour le tableau de bord administrateur
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/AdminView.vue'),
    beforeEnter: requireAdmin,
    meta: {
      title: 'Tableau de bord administrateur | MyBooks',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: 'Page non trouvée | MyBooks' },
  },
  {
    path: '/register-success',
    name: 'RegisterSuccess',
    component: () => import('../views/RegisterSuccessView.vue'),
    beforeEnter: requireGuest,
    meta: {
      title: 'Inscription réussie - MyBooks',
      requiresGuest: true,
    },
  },
  // Make sure you have a route definition that looks something like this:
  {
    path: '/category/:id', // or whatever path pattern you need
    name: 'CategoryBooks',
    component: () => import('../views/CategoryBooks.vue'), // Make sure this component exists
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    beforeEnter: requireGuest,
    meta: {
      title: 'Connexion - MyBooks',
      requiresGuest: true,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    beforeEnter: requireGuest,
    meta: {
      title: 'Inscription - MyBooks',
      requiresGuest: true,
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPasswordView.vue'),
    beforeEnter: requireGuest,
    meta: {
      title: 'Mot de passe oublié - MyBooks',
      requiresGuest: true,
    },
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPasswordView.vue'),
    props: true,
    beforeEnter: requireGuest,
    meta: {
      title: 'Réinitialisation du mot de passe - MyBooks',
      requiresGuest: true,
    },
  },
  // Routes protégées existantes...
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Mise à jour du titre de la page
router.afterEach((to) => {
  document.title = to.meta.title || 'MyBooks - Librairie en ligne';
});

export default router;
