<template>
  <div>
    <h5>Description</h5>
    <textarea v-model="description" class="form-control" rows="5"></textarea>
    <button class="btn btn-primary mt-3" @click="save">Save</button>
  </div>
</template>

<script>
export default {
  name: "ChangeDescriptionModal",
  props: {
    cAddress: String,
    cDescription: String,
    mdAddress: String,
  },
  data() {
    return {
      description: this.cDescription,
    };
  },
  methods: {
    save() {
      // Save logic here
      this.$emit("saveCollection", { description: this.description });
    },
  },
  watch: {
    cDescription(newVal) {
      this.description = newVal;
    },
  },
};
</script>
