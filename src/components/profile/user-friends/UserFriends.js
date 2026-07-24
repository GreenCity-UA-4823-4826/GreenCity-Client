import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import FriendService from '../../../services/user/FriendService';
import { useTranslation } from '../../../services/translation/TranslationService';
import UserProfileImage from '../../shared/user-profile-image/UserProfileImage';
import './UserFriends.scss';

// Arrow icons
const arrowPrevious = '/assets/img/arrow_left.svg';
const arrowNext = '/assets/img/arrow_right.svg';

/**
 * Component for displaying a user's friends
 */
const UserFriends = ({ profileUserId, isCurrentUser }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [usersFriends, setUsersFriends] = useState([]);
  const [amountOfFriends, setAmountOfFriends] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [onlineStatus, setOnlineStatus] = useState({});
  const friendsToShow = 6;

  const nextArrowRef = useRef(null);
  const previousArrowRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (!currentUser || !profileUserId) {
      return;
    }

    let active = true;

    const loadFriends = async () => {
      try {
        setLoading(true);
        const response = await FriendService.getUserFriends(
          profileUserId,
          slideIndex,
          friendsToShow
        );
        const friends = response.page || response.content || [];

        const statuses = await Promise.all(
          friends.map((friend) => FriendService.isUserOnline(friend.id))
        );

        if (!active) {
          return;
        }

        setError(null);
        setTotalPages(response.totalPages || 0);
        setUsersFriends(friends);
        setAmountOfFriends(response.totalElements || 0);
        setOnlineStatus(
          Object.fromEntries(friends.map((friend, index) => [friend.id, statuses[index]]))
        );

        const showArrows = friendsToShow < response.totalElements && window.innerWidth < 768;
        if (nextArrowRef.current && previousArrowRef.current) {
          nextArrowRef.current.style.visibility = showArrows ? 'visible' : 'hidden';
          previousArrowRef.current.style.visibility = showArrows ? 'visible' : 'hidden';
        }
      } catch (error) {
        if (active) {
          console.error('Error fetching friends:', error);
          setError('Failed to load friends. Please try again later.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFriends();
    return () => {
      active = false;
    };
  }, [currentUser, profileUserId, slideIndex]);

  /**
   * Navigate to friend's profile
   * @param {Object} friend - Friend to navigate to
   */
  const showFriendsInfo = (friend) => {
    navigate(`/profile/${friend.id}`);
  };

  /**
   * Change the displayed friends (previous or next page)
   * @param {boolean} isNext - Whether to go to the next page
   */
  const changeFriends = (isNext) => {
    if (isNext) {
      setSlideIndex((slideIndex + 1) % totalPages);
    } else if (slideIndex > 0) {
      setSlideIndex((slideIndex - 1) % totalPages);
    } else {
      setSlideIndex(totalPages - 1);
    }
  };

  /**
   * Check if a friend is online
   * @param {number} friendId - Friend ID
   * @returns {boolean} Whether the friend is online
   */
  const isFriendOnline = (friendId) => {
    return onlineStatus[friendId] || false;
  };

  if (loading && !usersFriends.length) {
    return (
      <div className="main-container outer">
        <div className="friends">
          <div className="loading">Loading friends...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container outer">
      <div className="friends">
        <div className="friends-text">
          <div className="text-main-content">
            <div>
              <p className="text-title">{t('profile.my-friends')}</p>
              <span className="text-number">
                {amountOfFriends} {t('profile.connections', { count: amountOfFriends })}
              </span>
            </div>
            {isCurrentUser && (
              <Link className="text-more" to={`/profile/${currentUser?.id}/friends`}>
                {t('profile.see-more')}
              </Link>
            )}
          </div>
        </div>

        {amountOfFriends > 0 ? (
          <div className="slider-wrapper">
            <img
              ref={previousArrowRef}
              className="friends-previous"
              onClick={() => changeFriends(false)}
              src={arrowPrevious}
              alt="arrow previous"
            />
            <div ref={sliderRef} className="friends-images">
              {usersFriends.map((friend) => (
                <div
                  className="friend-card"
                  key={friend.id}
                  onClick={() => showFriendsInfo(friend)}
                >
                  <UserProfileImage
                    imgPath={friend.profilePicturePath}
                    firstName={friend.name}
                    className="friend-img"
                    additionalImgClass="friend-user-profile"
                    isOnline={isFriendOnline(friend.id)}
                  />
                </div>
              ))}
            </div>
            <img
              ref={nextArrowRef}
              className="friends-next"
              onClick={() => changeFriends(true)}
              src={arrowNext}
              alt="arrow next"
            />
          </div>
        ) : (
          <div className="friends-empty">
            {isCurrentUser ? (
              <Link
                className="add-friend-circle"
                to={`/profile/${currentUser?.id}/friends/recommended`}
                aria-label={t('profile.find-friends')}
                title={error || t('profile.find-friends')}
              >
                <span aria-hidden="true">+</span>
              </Link>
            ) : (
              <p className="friends-empty-message">{t('profile.user-has-no-friends')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

UserFriends.propTypes = {
  profileUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isCurrentUser: PropTypes.bool.isRequired
};

export default UserFriends;
