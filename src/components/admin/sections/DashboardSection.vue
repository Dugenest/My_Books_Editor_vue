<!-- DashboardSection.vue - Composant du tableau de bord -->
<template>
  <section class="dashboard-section">
    <div class="section-header">
      <h2>Tableau de bord</h2>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon orders">
          <i class="fas fa-shopping-bag"></i>
        </div>
        <div class="stat-info">
          <h3>Commandes</h3>
          <p class="stat-value">{{ stats.totalOrders }}</p>
          <p
            class="stat-change"
            :class="stats.ordersChange >= 0 ? 'positive' : 'negative'"
          >
            <i
              :class="
                stats.ordersChange >= 0
                  ? 'fas fa-arrow-up'
                  : 'fas fa-arrow-down'
              "
            ></i>
            {{ Math.abs(stats.ordersChange) }}% cette semaine
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon revenue">
          <i class="fas fa-euro-sign"></i>
        </div>
        <div class="stat-info">
          <h3>Revenus</h3>
          <p class="stat-value">{{ formatPrice(stats.totalRevenue) }}</p>
          <p
            class="stat-change"
            :class="stats.revenueChange >= 0 ? 'positive' : 'negative'"
          >
            <i
              :class="
                stats.revenueChange >= 0
                  ? 'fas fa-arrow-up'
                  : 'fas fa-arrow-down'
              "
            ></i>
            {{ Math.abs(stats.revenueChange) }}% ce mois
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon users">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-info">
          <h3>Utilisateurs</h3>
          <p class="stat-value">{{ stats.totalUsers }}</p>
          <p
            class="stat-change"
            :class="stats.usersChange >= 0 ? 'positive' : 'negative'"
          >
            <i
              :class="
                stats.usersChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'
              "
            ></i>
            {{ Math.abs(stats.usersChange) }}% ce mois
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon books">
          <i class="fas fa-book"></i>
        </div>
        <div class="stat-info">
          <h3>Livres</h3>
          <p class="stat-value">{{ stats.totalBooks }}</p>
          <p class="stat-change">{{ stats.outOfStock }} en rupture de stock</p>
        </div>
      </div>
    </div>

    <div class="recent-activity">
      <h3>Activité récente</h3>
      <div class="activity-list">
        <div
          v-for="activity in recentActivity"
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-icon" :class="activity.type">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.text }}</p>
            <span class="activity-time">{{
              formatDate(activity.timestamp)
            }}</span>
          </div>
        </div>

        <div v-if="recentActivity.length === 0" class="no-data-card">
          <i class="fas fa-info-circle"></i>
          <p>Aucune activité récente</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DashboardSection',

  props: {
    stats: {
      type: Object,
      required: true,
    },
    recentActivity: {
      type: Array,
      required: true,
    },
    getActivityIcon: {
      type: Function,
      required: true,
    },
    formatDate: {
      type: Function,
      required: true,
    },
    formatPrice: {
      type: Function,
      required: true,
    },
  },
};
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.75rem;
  color: #333;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.orders {
  background-color: #e3f2fd;
  color: #1976d2;
}

.stat-icon.revenue {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.stat-icon.users {
  background-color: #fff3e0;
  color: #e65100;
}

.stat-icon.books {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.stat-info h3 {
  font-size: 0.875rem;
  color: #666;
  margin: 0 0 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.stat-change {
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-change.positive {
  color: #2e7d32;
}

.stat-change.negative {
  color: #d32f2f;
}

.recent-activity {
  margin-bottom: 2rem;
}

.recent-activity h3 {
  margin-bottom: 1rem;
  color: #333;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-icon.order {
  background-color: #e3f2fd;
  color: #1976d2;
}

.activity-icon.user {
  background-color: #fff3e0;
  color: #e65100;
}

.activity-icon.book {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 0.875rem;
  color: #333;
  margin: 0 0 0.25rem;
}

.activity-time {
  font-size: 0.75rem;
  color: #666;
}

.no-data-card {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.no-data-card i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #ddd;
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
