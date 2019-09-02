import { h, app } from "hyperapp";
import cookie from 'js-cookie';
import store from 'store';
import notus from 'notus';
import { getXsrf } from './_utilities';

const state = {
    username: '',
    password: '',
    remember: true,
    loading: false,
}


function createFormData({ username, password }) {
    const form = new FormData()
    form.set("username", username);
    form.set("password", password);
    return form;
}

function handleLoginResponse(response) {

    if (response.code == 200) {
        const data = response.data;
        cookie.set('UserID', data.user.ID)
        if (state.remember) {
            store.set('user', data.user);
            cookie.set('token', data.token);
        }
        // window.location.replace('/home');
    } else if (response.code == 500 || response.code == 404) {        
        notus().send({
            title: "Error",
            message: response.msg,
            autoCloseDuration: 3500,
            alertType: "failure",
        })
    }
}

const actions = {
    updateField: ({ type, value }) => state => {
        return { [type]: value }
    },
    updateRemember: () => state => ({
        remember: !state.remember
    }),
    updateLoading: (value) => state => ({
        loading: value
    }),
    handleSubmit: (e) => (state, actions) => {
        e.preventDefault();
        if (state.username && state.password) {
            actions.updateLoading(true);
            fetch("/auth/login", {
                method: "POST",
                headers: {
                    "X-Xsrftoken": getXsrf(cookie),
                },
                body: createFormData(state)
            }).then(response => response.json())
                .then(response => {

                    actions.updateLoading(false);
                    handleLoginResponse(response);

                })
        }
    }
}

const view = (state, actions) => (
    <form onsubmit={e => actions.handleSubmit(e)}>
        <div class="field">
            <div class="control">
                <input class="input is-large" type="text"
                    placeholder="Your username"
                    name="Username"
                    value={state.username}
                    onchange={e => actions.updateField({ type: "username", value: e.target.value })}
                    required
                    autofocus="" />
            </div>
        </div>

        <div class="field">
            <div class="control">
                <input class="input is-large"
                    type="password"
                    placeholder="Your password"
                    name="TextPassword"
                    value={state.password}
                    onchange={e => actions.updateField({ type: "password", value: e.target.value })}
                    required={true}
                    placeholder="Your Password" />
            </div>
        </div>
        <div class="field">
            <label class="checkbox">
                <input type="checkbox"
                    checked={state.remember}
                    onchange={e => actions.updateRemember()}
                />
                Remember me
                    </label>
        </div>
        <button
            class="button is-block is-info is-large is-fullwidth"
            onclick={e => actions.handleSubmit(e)}
            disabled={state.loading}
        >
            {state.loading ? "Logging..." : "Log in"}
        </button>
    </form>

)

app(state, actions, view, document.getElementById("loginApp"))