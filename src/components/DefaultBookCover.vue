<template>
  <div class="default-book-cover">
    <i class="fas fa-book"></i>
    <span v-if="showTitle" class="book-title">{{ title }}</span>
  </div>
</template>

<script>
export default {
  name: 'DefaultBookCover',
  props: {
    title: {
      type: String,
      default: '',
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String,
      default: 'medium', // small, medium, large
      validator: (value) => ['small', 'medium', 'large'].includes(value),
    },
  },
};
</script>

<style scoped>
.default-book-cover {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  color: #6c757d;
  padding: 1rem;
  border-radius: 4px;
}

.default-book-cover i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.default-book-cover.small i {
  font-size: 1.5rem;
}

.default-book-cover.large i {
  font-size: 3.5rem;
}

.book-title {
  font-size: 0.8rem;
  text-align: center;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-width: 100%;
}
</style>
