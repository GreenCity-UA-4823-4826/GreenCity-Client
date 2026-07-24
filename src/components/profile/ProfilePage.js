import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserService from '../../services/user/UserService';
import UsersAchievements from './users-achievements/UsersAchievements';
import UserFriends from './user-friends/UserFriends';
import EcoPlaces from './eco-places/EcoPlaces';
import ToDoList from './todo-list/ToDoList';
import CalendarWeek from './calendar/CalendarWeek';
import ProfileCards from './profile-cards/ProfileCards';
import './ProfilePage.scss';

const ProfilePage = () => {
  const { userId } = useParams();
  const { currentUser, loading: authLoading, isAuthenticated, getUserId } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [habits, setHabits] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    // Check if user is authenticated and if the profile belongs to the current user
    if (!isAuthenticated()) {
      navigate('/auth/sign-in', { state: { message: 'Please sign in to view profiles.' } });
      return;
    }

    const currentUserId = String(currentUser?.id ?? getUserId());
    setIsCurrentUser(currentUserId === userId);

    loadUserData();
  }, [userId, currentUser, authLoading, isAuthenticated, getUserId, navigate]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const profileData = await UserService.getUserProfile(userId);
      setProfile(profileData);
      setError(null);

      const [habitsResult, statisticsResult] = await Promise.allSettled([
        UserService.getUserHabits(userId),
        UserService.getUserHabitStatistics(userId)
      ]);

      setHabits(habitsResult.status === 'fulfilled' ? habitsResult.value : []);
      setStatistics(statisticsResult.status === 'fulfilled' ? statisticsResult.value : null);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError(
        error.response?.status === 401
          ? 'Your session has expired. Please sign in again.'
          : 'Failed to load user data. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (habitData) => {
    try {
      await UserService.addHabit(userId, habitData);
      // Reload habits after adding a new one
      const habitsData = await UserService.getUserHabits(userId);
      setHabits(habitsData);
    } catch (error) {
      console.error('Error adding habit:', error);
      setError('Failed to add habit. Please try again later.');
    }
  };

  const updateHabit = async (habitId, habitData) => {
    try {
      await UserService.updateHabit(habitId, habitData);
      // Reload habits after updating
      const habitsData = await UserService.getUserHabits(userId);
      setHabits(habitsData);
    } catch (error) {
      console.error('Error updating habit:', error);
      setError('Failed to update habit. Please try again later.');
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      await UserService.deleteHabit(habitId);
      // Reload habits after deleting
      const habitsData = await UserService.getUserHabits(userId);
      setHabits(habitsData);
    } catch (error) {
      console.error('Error deleting habit:', error);
      setError('Failed to delete habit. Please try again later.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading-spinner">
            <p>Loading user profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="error-message">
            <p>{error}</p>
            <button className="retry-button" onClick={loadUserData}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header with User Info and Progress */}
        <div className="profile-header">
          <div className="profile-avatar">
            <img
              src={profile?.profilePicturePath || 'assets/img/default-avatar.png'}
              alt="Profile"
            />
          </div>
          <div className="profile-info">
            <h1>{profile?.name || 'User'}</h1>
            <p className="profile-email">{profile?.email}</p>
            {isCurrentUser && (
              <button
                className="edit-profile-button"
                onClick={() => navigate(`/profile/${currentUser.id}/edit`)}
              >
                Edit Profile
              </button>
            )}
          </div>
          {statistics && (
            <div className="profile-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${statistics.completionRate || 0}%` }}
                ></div>
              </div>
              <p className="progress-text">{statistics.completionRate || 0}% Complete</p>
            </div>
          )}
        </div>

        {/* Three-column layout similar to Angular version */}
        <div className="profile-content">
          {/* Left Column */}
          <div className="left-column">
            {/* User Achievements Section */}
            <div className="achievements-section section-card">
              <UsersAchievements />
            </div>

            {/* User Friends Section */}
            <div className="friends-section">
              <UserFriends profileUserId={userId} isCurrentUser={isCurrentUser} />
            </div>

            {/* Eco Places Section */}
            <div className="eco-places-section section-card">
              <EcoPlaces />
            </div>
          </div>

          {/* Center Column - Habits Dashboard */}
          <div className="center-column">
            <div className="habits-section section-card">
              <div className="section-header">
                <h2>My Eco Habits</h2>
                {isCurrentUser && <button className="add-habit-button">Add New Habit</button>}
              </div>

              {habits.length > 0 ? (
                <div className="habits-list">
                  {habits.map((habit) => (
                    <div key={habit.id} className="habit-card">
                      <h3>{habit.name}</h3>
                      <p>{habit.description}</p>
                      <div className="habit-stats">
                        <span>Progress: {habit.progress || 0}%</span>
                        <span>Started: {new Date(habit.creationDate).toLocaleDateString()}</span>
                      </div>
                      {isCurrentUser && (
                        <div className="habit-actions">
                          <button onClick={() => updateHabit(habit.id, habit)}>Edit</button>
                          <button onClick={() => deleteHabit(habit.id)}>Delete</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-habits">
                  No habits found. Start your eco-friendly journey by adding a new habit!
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Calendar Section */}
            <div className="calendar-section section-card">
              <h2>Habit Calendar</h2>
              <CalendarWeek />
            </div>

            {/* Statistics Section */}
            <div className="statistics-section section-card">
              <h2>Statistics</h2>
              {statistics ? (
                <div className="statistics-content">
                  <div className="statistic-item">
                    <h3>Total Habits</h3>
                    <p className="statistic-value">{habits.length}</p>
                  </div>
                  <div className="statistic-item">
                    <h3>Active Days</h3>
                    <p className="statistic-value">{statistics.activeDays || 0}</p>
                  </div>
                  <div className="statistic-item">
                    <h3>Completed Habits</h3>
                    <p className="statistic-value">{statistics.completedHabits || 0}</p>
                  </div>
                </div>
              ) : (
                <p className="no-statistics">No statistics available yet.</p>
              )}
            </div>

            {/* Profile Cards Section */}
            <div className="profile-cards-section">
              <ProfileCards />
            </div>

            {/* To-Do List Section */}
            <div className="todo-list-section section-card">
              <h2>To-Do List</h2>
              <ToDoList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
