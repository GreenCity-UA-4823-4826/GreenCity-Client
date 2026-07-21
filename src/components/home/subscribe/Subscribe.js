import React, { useState } from 'react';
import { MVP_API_URL } from '../../../config/api';
import { useTranslation } from '../../../services/translation/TranslationService';
import './Subscribe.scss';

const Subscribe = () => {
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  // Email regex pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const qrCode = 'assets/img/qr-code.png';

  const validateEmail = (value) => {
    const isValid = value.length > 0 && emailRegex.test(value);
    setEmailValid(isValid);
    return isValid;
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setMessage('');
    setEmailTouched(true);
    validateEmail(newEmail.trim());
  };

  const subscribeToNewsletter = async () => {
    const trimmedEmail = email.trim();
    if (validateEmail(trimmedEmail)) {
      setMessage('');

      try {
        const response = await fetch(`${MVP_API_URL}/news-subscribers`, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({ email: trimmedEmail })
        });

        const responseText = await response.text();
        let resultResponse = {};

        if (responseText) {
          try {
            resultResponse = JSON.parse(responseText);
          } catch {
            resultResponse = { message: responseText };
          }
        }

        if (!response.ok) {
          setMessage(
            response.status === 400
              ? t('homepage.subscription.already-subscribed')
              : resultResponse.message || t('homepage.subscription.failed-connect')
          );
        } else {
          setSubscribed(true);
          setMessage('');
          setEmail('');
          setEmailTouched(false);
          setEmailValid(false);
        }
      } catch (error) {
        setMessage(t('homepage.subscription.failed-connect-server'));
      }
    } else {
      setEmailTouched(true);
    }
  };

  return (
    <div id="subscribe">
      <div id="subscribe-wrapper">
        <div id="qr-code-wrapper">
          <img src={qrCode} alt="Scan this QR-code To access the mobile version of the app" />
        </div>
        <div id="form-wrapper">
          <h2>{t('homepage.subscription.caption')}</h2>
          <p>{t('homepage.subscription.content')}</p>
          {subscribed && (
            <p className="subscribe-success">{t('homepage.subscription.thank-you-subcribe')}</p>
          )}
          <div className="form-input">
            <div className="subscription-controls">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder={t('homepage.subscription.placeholder')}
                required
              />
              <button
                className="primary-global-button btn"
                onClick={subscribeToNewsletter}
                disabled={!emailValid}
              >
                {t('homepage.subscription.button-subscribe')}
              </button>
            </div>
            <p id="validation-error" className={!emailTouched || emailValid ? 'hidden' : 'visible'}>
              {t('homepage.subscription.validation-error')}
            </p>
            {message && <p className="subscription-error">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
