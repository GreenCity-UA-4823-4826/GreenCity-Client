import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import FriendService from '../../../services/user/FriendService';
import UserProfileImage from '../../shared/user-profile-image/UserProfileImage';
import './FriendsPage.scss';

const PAGE_SIZE = 12;

const FriendsPage = () => {
  const { userId } = useParams();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyUserId, setBusyUserId] = useState(null);

  const showRecommended = location.pathname.endsWith('/recommended');
  const isOwnProfile = String(currentUser?.id) === String(userId);

  const loadData = useCallback(async () => {
    if (!currentUser || !isOwnProfile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (showRecommended) {
        const response = await FriendService.searchPotentialFriends(search, 0, PAGE_SIZE);
        setRecommended(response.content || []);
      } else {
        const [friendsResult, requestsResult] = await Promise.allSettled([
          FriendService.getAllFriends(0, PAGE_SIZE),
          FriendService.getFriendRequests(0, PAGE_SIZE)
        ]);

        if (friendsResult.status === 'rejected') {
          throw friendsResult.reason;
        }

        const friendsResponse = friendsResult.value;
        setFriends(friendsResponse.page || friendsResponse.content || []);

        if (requestsResult.status === 'fulfilled') {
          const requestsResponse = requestsResult.value;
          setRequests(requestsResponse.page || requestsResponse.content || []);
        } else {
          setRequests([]);
        }
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load friends.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, isOwnProfile, search, showRecommended]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const performAction = async (friendId, action) => {
    try {
      setBusyUserId(friendId);
      setError('');
      await action(friendId);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The friend action failed.');
    } finally {
      setBusyUserId(null);
    }
  };

  const renderUser = (user, actions) => (
    <article className="friends-page__card" key={user.id}>
      <Link to={`/profile/${user.id}`} className="friends-page__identity">
        <UserProfileImage
          imgPath={user.profilePicturePath}
          firstName={user.name}
          className="friends-page__avatar"
        />
        <span>
          <strong>{user.name}</strong>
          <small>{user.email}</small>
        </span>
      </Link>
      <div className="friends-page__actions">
        {actions.map((action) => (
          <button
            type="button"
            key={action.label}
            className={action.secondary ? 'secondary' : ''}
            disabled={busyUserId === user.id}
            onClick={() => performAction(user.id, action.handler)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </article>
  );

  if (!isOwnProfile && currentUser) {
    return (
      <main className="friends-page">
        <p>You can manage friends only from your own profile.</p>
      </main>
    );
  }

  return (
    <main className="friends-page">
      <div className="friends-page__header">
        <div>
          <Link to={`/profile/${userId}`}>← Back to profile</Link>
          <h1>Eco friends</h1>
        </div>
        <nav>
          <Link className={!showRecommended ? 'active' : ''} to={`/profile/${userId}/friends`}>
            My friends
          </Link>
          <Link
            className={showRecommended ? 'active' : ''}
            to={`/profile/${userId}/friends/recommended`}
          >
            Find friends
          </Link>
        </nav>
      </div>

      {showRecommended && (
        <input
          className="friends-page__search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name"
        />
      )}

      {error && <p className="friends-page__error">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && !showRecommended && (
        <>
          {requests.length > 0 && (
            <section>
              <h2>Friend requests</h2>
              <div className="friends-page__grid">
                {requests.map((user) =>
                  renderUser(user, [
                    { label: 'Accept', handler: FriendService.acceptFriendRequest },
                    {
                      label: 'Decline',
                      handler: FriendService.declineFriendRequest,
                      secondary: true
                    }
                  ])
                )}
              </div>
            </section>
          )}
          <section>
            <h2>My friends ({friends.length})</h2>
            {friends.length ? (
              <div className="friends-page__grid">
                {friends.map((user) =>
                  renderUser(user, [
                    { label: 'Remove', handler: FriendService.removeFriend, secondary: true }
                  ])
                )}
              </div>
            ) : (
              <p>You do not have friends yet. Open “Find friends” to send a request.</p>
            )}
          </section>
        </>
      )}

      {!loading && showRecommended && (
        <section>
          <h2>People you may know</h2>
          {recommended.length ? (
            <div className="friends-page__grid">
              {recommended.map((user) => {
                const actions =
                  user.friendshipStatus === 'PENDING' && user.requestedByCurrentUser
                    ? [
                        {
                          label: 'Cancel request',
                          handler: FriendService.cancelFriendRequest,
                          secondary: true
                        }
                      ]
                    : user.friendshipStatus === 'PENDING'
                      ? [
                          {
                            label: 'Accept',
                            handler: FriendService.acceptFriendRequest
                          },
                          {
                            label: 'Decline',
                            handler: FriendService.declineFriendRequest,
                            secondary: true
                          }
                        ]
                      : [{ label: 'Add friend', handler: FriendService.addFriend }];

                return renderUser(user, actions);
              })}
            </div>
          ) : (
            <p>No users found.</p>
          )}
        </section>
      )}
    </main>
  );
};

export default FriendsPage;
