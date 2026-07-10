import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import PropTypes from 'prop-types';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from '../../../services/translation/TranslationService';
import './GoogleButton.scss';

/**
 * Google Sign-In Button component using @react-oauth/google
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Callback function on successful sign-in
 * @param {Function} props.onError - Callback function on sign-in error
 * @param {boolean} props.useHeaderAuth - Whether to use header-based authentication (default: false)
 * @param {boolean} props.useGetAuth - Whether to use GET-based authentication (default: false)
 * @returns {JSX.Element} - Rendered component
 */
const GoogleButton = ({ onSuccess, onError, useHeaderAuth = false, useGetAuth = false }) => {
  const { signInWithGoogle, signInWithGoogleHeader, signInWithGoogleGet } = useAuth();
  const { currentLanguage } = useTranslation();

  const handleSuccess = async (credentialResponse) => {
    try {
      console.log('Google Sign-In successful:', credentialResponse);

      const token = credentialResponse.credential;

      let userData;

      if (useGetAuth) {
        userData = await signInWithGoogleGet(token, currentLanguage);
      } else if (useHeaderAuth) {
        userData = await signInWithGoogleHeader(token, currentLanguage);
      } else {
        userData = await signInWithGoogle(token, currentLanguage);
      }

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(userData);
      }
    } catch (error) {
      console.error('Error processing Google sign-in:', error);

      if (onError && typeof onError === 'function') {
        onError(error);
      }
    }
  };

  const handleError = (error) => {
    console.error('Google Sign-In error:', error);

    if (onError && typeof onError === 'function') {
      onError(error);
    }
  };

  const locale = currentLanguage === 'ua' ? 'uk' : currentLanguage || 'en';

  return (
    <div className="google-button-container">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        locale={locale}
        text="signin_with"
        theme="outline"
        size="large"
      />
    </div>
  );
};

GoogleButton.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  useHeaderAuth: PropTypes.bool,
  useGetAuth: PropTypes.bool
};

export default GoogleButton;
