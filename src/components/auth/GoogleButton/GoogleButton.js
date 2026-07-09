import React from 'react';
import {GoogleLogin} from '@react-oauth/google';
import {useAuth} from '../../../contexts/AuthContext';
import {useTranslation} from '../../../services/translation/TranslationService';
import './GoogleButton.scss';

/**
 * Google Sign-In Button component using @react-oauth/google
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Callback function on successful sign-in
 * @param {Function} props.onError - Callback function on sign-in error
 * @param {boolean} props.isManager - Whether to use manager client ID (not used with @react-oauth/google)
 * @param {boolean} props.useHeaderAuth - Whether to use header-based authentication (default: false)
 * @param {boolean} props.useGetAuth - Whether to use GET-based authentication (default: false)
 * @returns {JSX.Element} - Rendered component
 */
const GoogleButton = ({onSuccess, onError, isManager = false, useHeaderAuth = false, useGetAuth = false}) => {
    const {signInWithGoogle, signInWithGoogleHeader, signInWithGoogleGet} = useAuth();
    const {currentLanguage, t} = useTranslation();

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

    const locale = 'en';
    const googleButtonOverlayStyle = {
        position: 'absolute',
        inset: 0,
        opacity: 0.01,
        overflow: 'hidden',
        cursor: 'pointer'
    };

    return (
        <div className="google-button-container">
            <div style={{position: 'relative', width: '100%', height: 40}}>
                <div className="google-button-custom" aria-hidden="true">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo"/>
                    <span>{t('auth.googleSignIn', 'Sign in with Google')}</span>
                </div>
                <div style={googleButtonOverlayStyle}>
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        useOneTap={false}
                        locale={locale}
                        text="signin_with"
                        width="400"
                    />
                </div>
            </div>
        </div>
    );
};

export default GoogleButton;
