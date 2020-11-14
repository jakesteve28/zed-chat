export default {
    tagName: /^([a-zA-Z0-9_-]){8,20}$/,
    password: /^([a-zA-Z0-9_\-\$\#\%\^\&\*\(\)]){8,32}$/,
    email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    firstName: /^([A-Z]){1}([a-zA-Z]){1,32}$/,
    lastName: /^([A-Z]){1}([a-zA-Z]){1,32}$/,
};