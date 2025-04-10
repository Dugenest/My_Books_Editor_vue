import store from '@/store';
import HomeView from '@/views/HomeView.vue';
import SeriesDetailsView from '@/views/SeriesDetailsView.vue';
import SeriesView from '@/views/SeriesView.vue';
import { createRouter, createWebHistory } from 'vue-router';
import RegisterView from '../views/RegisterView.vue';

// Vérifier si l'authentification a été vérifiée
const waitForAuthCheck = async () => {
  if (!store.getters['auth/isAuthChecked']) {
    console.log(
      'Authentification pas encore vérifiée, vérification en cours...'
    );
    await store.dispatch('auth/checkAuth');
  }
};

// Garde de route pour les pages nécessitant une authentification
const requireAuth = async (to, from, next) => {
  await waitForAuthCheck();

  console.log(
    "Vérification de l'authentification:",
    store.getters['auth/isAuthenticated']
  );

  if (!store.getters['auth/isAuthenticated']) {
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

// Garde de route pour les pages nécessitant un rôle spécifique
const requireRole = (roles) => {
  return async (to, from, next) => {
    await waitForAuthCheck();

    console.log(`Vérification des rôles requis: ${roles.join(', ')}`);

    // Vérifier si l'utilisateur est connecté
    if (!store.getters['auth/isAuthenticated']) {
      console.log('Non authentifié, redirection vers login');
      next({
        name: 'Login',
        query: { redirect: to.fullPath },
      });
      return;
    }

    // Vérifier si l'utilisateur a un des rôles requis
    const hasRequiredRole = roles.some((role) =>
      store.getters['auth/hasRole'](role)
    );

    if (hasRequiredRole) {
      console.log('Rôle autorisé, accès accordé');
      next();
    } else {
      console.log('Rôle non autorisé, accès refusé');
      next({ name: 'AccessDenied' });
    }
  };
};

// Gardes spécifiques pour chaque type de route
const requireAdmin = requireRole(['ADMIN']);
const requireAuthor = requireRole(['ADMIN', 'AUTHOR']);
const requireEditor = requireRole(['ADMIN', 'EDITOR']);

// Garde de route pour les pages accessibles uniquement aux utilisateurs non connectés
const requireGuest = async (to, from, next) => {
  await waitForAuthCheck();

  console.log(
    'Vérification du statut guest:',
    !store.getters['auth/isAuthenticated']
  );

  if (store.getters['auth/isAuthenticated']) {
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
    path: '/search',
    name: 'SearchResults',
    component: () => import('@/views/SearchResultsView.vue'),
    props: (route) => ({ query: route.query.q }),
    meta: {
      title: 'Résultats de recherche - MyBooks',
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    beforeEnter: requireAuth,
    meta: {
      title: 'Mon profil | MyBooks',
      requiresAuth: true,
    },
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: () => import('@/views/AccessDeniedView.vue'),
    meta: { title: 'Accès refusé | MyBooks' },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/AdminView.vue'),
    beforeEnter: requireAdmin,
    meta: {
      title: 'Administration | MyBooks',
      requiresAuth: true,
      requiredRoles: ['ADMIN'],
    },
  },
  {
    path: '/admin/author',
    name: 'AuthorDashboard',
    component: () => import('@/views/AdminView.vue'),
    beforeEnter: requireAuthor,
    meta: {
      title: 'Espace auteur | MyBooks',
      requiresAuth: true,
      requiredRoles: ['ADMIN', 'AUTHOR'],
    },
  },
  {
    path: '/admin/editor',
    name: 'EditorDashboard',
    component: () => import('@/views/AdminView.vue'),
    beforeEnter: requireEditor,
    meta: {
      title: 'Espace éditeur | MyBooks',
      requiresAuth: true,
      requiredRoles: ['ADMIN', 'EDITOR'],
    },
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: () => import('@/views/AdminView.vue'),
    beforeEnter: requireAdmin,
    meta: {
      title: 'Paramètres du site | MyBooks',
      requiresAuth: true,
      requiredRoles: ['ADMIN'],
    },
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
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login/index.vue'),
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
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/CategoriesView.vue'),
    meta: { title: 'Catégories | MyBooks' },
  },
  {
    path: '/category/:id',
    name: 'CategoryBooks',
    component: () => import('../views/CategoryBooks.vue'),
  },
  {
    path: '/book/:id',
    name: 'BookDetails',
    component: () => import('../views/BookDetailsView.vue'),
    props: true,
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
  {
    path: '/authors',
    name: 'Authors',
    component: () => import('@/views/AuthorsView.vue'),
    meta: { title: 'Auteurs | MyBooks' },
  },
  {
    path: '/author/:id',
    name: 'AuthorDetails',
    component: () => import('@/views/AuthorDetailsView.vue'),
    props: true,
  },
  {
    path: '/series',
    name: 'Series',
    component: SeriesView,
  },
  {
    path: '/series/:id',
    name: 'SeriesDetails',
    component: SeriesDetailsView,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: 'Page non trouvée | MyBooks' },
  },
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

// Ajout d'un hook global pour déboguer les redirections
router.beforeEach(async (to, from, next) => {
  console.log(`Navigation de ${from.path} vers ${to.path}`);

  // Vérifier l'authentification au chargement initial
  if (!store.getters['auth/isAuthChecked']) {
    console.log("Vérification de l'authentification avant navigation...");
    await store.dispatch('auth/checkAuth');
  }

  next();
});

// Mise à jour du titre de la page
router.afterEach((to) => {
  document.title = to.meta.title || 'MyBooks - Librairie en ligne';
});

export default router;
