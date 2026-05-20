const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const toStringSafe = (value) => String(value ?? '').trim();
const normalizeAccountNumber = (value) => toStringSafe(value).replace(/[\s-]+/g, '');

export const isObjectId = (value) => OBJECT_ID_PATTERN.test(toStringSafe(value));

export const resolveAccountReference = async (reference, accounts = [], favorites = [], lookupAccountByNumber = null) => {
    const candidate = toStringSafe(reference);
    const normalizedCandidate = normalizeAccountNumber(reference);

    if (!candidate) {
        return { accountId: '', matched: false };
    }

    const accountMatch = accounts.find((account) => {
        const accountId = toStringSafe(account?._id || account?.id);
        const accountNumber = toStringSafe(account?.accountNumber);
        return candidate === accountId || candidate === accountNumber || normalizedCandidate === normalizeAccountNumber(accountNumber);
    });

    if (accountMatch) {
        return {
            accountId: toStringSafe(accountMatch._id || accountMatch.id),
            matched: true,
        };
    }

    const favoriteMatch = favorites.find((favorite) => {
        const favoriteId = toStringSafe(favorite?._id || favorite?.id);
        const favoriteAccountId = toStringSafe(favorite?.accountId);
        const favoriteAccountNumber = toStringSafe(
            favorite?.accountNumber || favorite?.account?.accountNumber
        );

        return (
            candidate === favoriteId ||
            candidate === favoriteAccountId ||
            candidate === favoriteAccountNumber ||
            normalizedCandidate === normalizeAccountNumber(favoriteAccountNumber) ||
            candidate === toStringSafe(favorite?.alias)
        );
    });

    if (favoriteMatch) {
        const favoriteAccountId = toStringSafe(favoriteMatch.accountId || favoriteMatch.account?._id || favoriteMatch.account?.id);

        if (favoriteAccountId) {
            return { accountId: favoriteAccountId, matched: true };
        }
    }

    if (isObjectId(candidate)) {
        return { accountId: candidate, matched: true };
    }

    if (typeof lookupAccountByNumber === 'function') {
        try {
            const lookedUp = await lookupAccountByNumber(normalizedCandidate || candidate);
            const resolvedAccount = lookedUp?.account ?? lookedUp?.data?.account ?? lookedUp?.data ?? lookedUp ?? null;
            const accountId = toStringSafe(resolvedAccount?._id || resolvedAccount?.id);

            if (accountId) {
                return { accountId, matched: true };
            }
        } catch {
            // ignore lookup failures and fall through
        }
    }

    return { accountId: '', matched: false };
};