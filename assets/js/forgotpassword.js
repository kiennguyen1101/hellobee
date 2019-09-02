import { h, app } from "hyperapp";
import cookie from 'js-cookie';
import store from 'store';
import notus from 'notus';
import { getXsrf, isRequestSuccess } from './_utilities';

const state = {
  email: null,
  loading: false,
}

function createFormData({ email }) {
  const form = new FormData()
  form.set("email", email);
  return form;
}

const actions = {
  updateField: ({ type, value }) => state => {
    return { [type]: value }
  },
  updateLoading: (value) => state => ({
    loading: value
  }),
  handleSubmit: (e) => (state, actions) => {
    e.preventDefault();
    console.log(state);
    if (state.email) {
      actions.updateLoading(true);
      fetch("/auth/forgotpassword", {
        method: "POST",
        headers: {
          "X-Xsrftoken": getXsrf(cookie),
        },
        body: createFormData(state)
      }).then(response => response.json()).then(isRequestSuccess)
        .then(response => {
          const data = response.data;
          cookie.set('UserID', data.user.ID)
          if (state.remember) {
            store.set('user', {});
            cookie.set('token', data.token);
          }
        }).catch(error => {
          notus().send({
            title: "Error",
            message: error.msg,
            alertType: "failure",
          })
        }).finally(actions.updateLoading(false));
    }
  }
}

const view = (state, actions) => {
  return (
    <form onsubmit={e => actions.handleSubmit(e)}>
      <div class="field">
        <div class="control">
          <input
            class="input is-large"
            required
            type="text"
            placeholder="Your email"
            name="email"
            autofocus=""
            onchange={e => actions.updateField({ type: "email", value: e.target.value })} />
        </div>
      </div>
      <button
        onclick={e => actions.handleSubmit(e)}
        disabled={state.loading}
        class="button is-block is-info is-large is-fullwidth"
      >
          Recover Password
      </button>
    </form>
  );
}

app(state, actions, view, document.getElementById("forgotPasswordApp"));