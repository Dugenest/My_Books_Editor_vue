import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import RegisterView from '../views/RegisterView.vue';
import AuthService from '@/services/AuthService';
import SeriesView from '@/views/SeriesView.vue';
import SeriesDetailsView from '@/views/SeriesDetailsView.vue';

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
const requireAdmin = async (to, from, next) => {
  try {
    if (!AuthService.isAuthenticated()) {
      console.log('Non authentifié, redirection vers login');
      next({
        name: 'Login',
        query: { redirect: to.fullPath },
      });
      return;
    }

    const response = await AuthService.getCurrentUser();
    const currentUser = response.data;

    console.log('Vérification des permissions admin:', {
      isAuthenticated: AuthService.isAuthenticated(),
      user: currentUser,
      role: currentUser ? currentUser.role : 'aucun',
    });

    // Code de débogage pour vérifier le rôle
    console.log(
      'Test de rôle:',
      currentUser && currentUser.role,
      currentUser && currentUser.role === 'ADMIN',
      currentUser && currentUser.role === 'admin',
      currentUser && currentUser.role === 'ROLE_ADMIN',
      currentUser && currentUser.role === 'ROLE_admin'
    );

    if (
      currentUser &&
      (currentUser.role.toUpperCase() === 'ADMIN' ||
        currentUser.role.toLowerCase() === 'admin' ||
        currentUser.role === 'ROLE_admin' ||
        currentUser.role === 'ROLE_ADMIN')
    ) {
      console.log('Utilisateur ADMIN, accès autorisé');
      next();
    } else {
      console.log('Accès refusé, redirection');
      next({ name: 'AccessDenied' });
    }
  } catch (error) {
    console.error(
      'Erreur lors de la vérification des permissions admin:',
      error
    );
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
      title: 'Tableau de bord administrateur | MyBooks',
      requiresAuth: true,
      requiresAdmin: true,
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
      requiresAdmin: true,
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
router.beforeEach((to, from, next) => {
  console.log(`Navigation de ${from.path} vers ${to.path}`);
  next();
});

// Mise à jour du titre de la page
router.afterEach((to) => {
  document.title = to.meta.title || 'MyBooks - Librairie en ligne';
});

export default router;
