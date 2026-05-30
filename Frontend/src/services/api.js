// API base configuration
import apiClient from './apiClient';
import * as auth from './auth';
import * as quizzes from './quizzes';
import * as attempts from './attempts';
import * as answers from './answers';
import * as profile from './profile';
import * as stats from './stats';
import * as questions from './questions'
import * as users from './users';
import * as notifications from './notifications';
import * as subjects from './subjects';

// Keep single default object for compatibility with existing imports
const apiService = {
  request: (...args) => apiClient.request(...args),
  ...auth,
  ...quizzes,
  ...attempts,
  ...answers,
  ...profile,
  ...stats,
  ...questions,
  ...users,
  ...notifications,
  ...subjects,
};

export default apiService;

// Also export modules individually if someone wants to import granularly
export { auth, quizzes, attempts, answers, profile, stats, questions, users, subjects, notifications };
