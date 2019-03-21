module.exports = {
	extends: 'airbnb-base',
	rules: {
		'no-console': 'off',
		'max-len': [
			'error',
			{
				'code': 200,
				'ignoreComments': true,
			}
		],
		'no-plusplus': 0,
		'no-nested-ternary': 0
	},
	globals: {
		$: true,
		_: true,
		fetch: true,
		window: true,
		document: true,
		fabric: true,
	},
};