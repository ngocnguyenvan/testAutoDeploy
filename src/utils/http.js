import Constants from '../Constant'

module.exports = {
    makeRequest: function({ sync = false, method = 'GET', path, params = '', success, error }) {
        $.ajax({
				url: Constants.SERVER_API + path,
				dataType: 'json',
                async: sync,
				type: method,
				data: params,
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "JWT " + sessionStorage.getItem('token'));
				},
				success: function(data) {
					success &&
                        success(data)
				}.bind(this),
				error: function(err) {
					if(err.status === 401)
					{
						browserHistory.push('/Account/SignIn');
					}
					error &&
						error(err)
				}.bind(this)
			});
    }
}