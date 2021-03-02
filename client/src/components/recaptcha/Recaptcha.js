import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha'; 
import PropTypes from 'prop-types';
export default function Recaptcha({ recaptchaChanged, recaptchaError, recaptchaExpired }){
    return (
        <ReCAPTCHA
            sitekey={`6LfVsGYaAAAAAIyGhfP9vq0NrvHEpSvHrI3WspyP`}
            onChange={() => recaptchaChanged(true)}
            onErrored={() => recaptchaError(true) }
            onExpired={() => recaptchaExpired(true) }
            theme="dark"
        >
        </ReCAPTCHA>
    )
}
Recaptcha.propTypes = {
    recaptchaChanged: PropTypes.func, 
    recaptchaError: PropTypes.func, 
    recaptchaExpired: PropTypes.func
}