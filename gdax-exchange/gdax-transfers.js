exports.fetcher = (authedClient, log, catchApiError, handleError) => {
  return async (accountId) => {
    return authedClient.getAccountTransfers(accountId)
      .then(log('GDAX: getAccountTransfers'))
      .then(catchApiError)
      .catch(handleError('transfers'))
  }
}
