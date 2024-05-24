<template>
  <div class="leaderboard-page">
    <div class="user-info">
      <img :src="userAvatar" alt="User Avatar" class="user-avatar" />
      <div class="user-details">
        <h2>{{ userName }}</h2>
        <p>Position: {{ userPosition }}</p>
        <p>Points: {{ userPoints }}</p>
      </div>
    </div>
    <div class="leaderboard">
      <h2>Top 100 Users</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Avatar</th>
            <th>Name</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in topUsers" :key="user.rank">
            <td>{{ user.rank }}</td>
            <td><img :src="user.avatar" alt="User Avatar" class="avatar" /></td>
            <td>{{ user.name }}</td>
            <td>{{ user.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "LeaderboardPage",
  data() {
    return {
      userAvatar: "https://via.placeholder.com/150",
      userName: "Current User",
      userPosition: 10,
      userPoints: 1234,
      topUsers: [
        // Array of 100 users with fictitious data
        {
          rank: 1,
          avatar: "https://via.placeholder.com/50",
          name: "User 1",
          points: 5000,
        },
        {
          rank: 2,
          avatar: "https://via.placeholder.com/50",
          name: "User 2",
          points: 4500,
        },
        {
          rank: 3,
          avatar: "https://via.placeholder.com/50",
          name: "User 3",
          points: 4400,
        },
        // Add more users up to rank 100
      ],
    };
  },
};
</script>

<style scoped>
.leaderboard-page {
  background: linear-gradient(to right, #ff7e5f, #feb47b);
  min-height: 100vh;
  padding: 20px;
  color: #fff;
  text-align: center;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 20px;
}

.user-details h2 {
  margin: 0;
}

.leaderboard {
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  padding: 10px;
  border: 1px solid #fff;
}

th {
  background: rgba(255, 255, 255, 0.2);
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
</style>
