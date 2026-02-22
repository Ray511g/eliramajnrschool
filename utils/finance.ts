import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type TransactionEntry = {
    accountCode: string;
    description: string;
    debit: number;
    credit: number;
};

/**
 * Posts a balanced transaction to the general ledger.
 * Debit total must equal Credit total.
 */
export async function postTransaction(
    transactionId: string,
    entries: TransactionEntry[],
    reference?: string,
    date: Date = new Date()
) {
    // 1. Validate balance
    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(`Transaction imbalanced: Debit (${totalDebit}) !== Credit (${totalCredit})`);
    }

    return await prisma.$transaction(async (tx) => {
        const results = [];

        for (const entry of entries) {
            // Find account
            const account = await tx.account.findUnique({
                where: { code: entry.accountCode }
            });

            if (!account) {
                throw new Error(`Account code ${entry.accountCode} not found`);
            }

            // Update account balance
            // For ASSET and EXPENSE: Debit increases, Credit decreases
            // For LIABILITY, EQUITY, INCOME: Credit increases, Debit decreases
            let balanceChange = 0;
            if (['ASSET', 'EXPENSE'].includes(account.type)) {
                balanceChange = entry.debit - entry.credit;
            } else {
                balanceChange = entry.credit - entry.debit;
            }

            await tx.account.update({
                where: { id: account.id },
                data: { balance: { increment: balanceChange } }
            });

            // Post journal entry
            const journal = await tx.journalEntry.create({
                data: {
                    transactionId,
                    accountId: account.id,
                    description: entry.description,
                    debit: entry.debit,
                    credit: entry.credit,
                    reference,
                    date
                }
            });

            results.push(journal);
        }

        return results;
    });
}
