import { prisma } from '../lib/prisma';

export type ApprovalEntityType =
    | 'PURCHASE_ORDER'
    | 'FEE_AGREEMENT'
    | 'PROMISSORY_NOTE'
    | 'PAYROLL'
    | 'SALARY_ADJUSTMENT'
    | 'BUDGET_OVERRIDE'
    | 'CONTRACT'
    | 'ASSET_PURCHASE';

export async function createApprovalRequest(data: {
    entityType: ApprovalEntityType;
    entityId: string;
    requestedById: string;
    requestedByName: string;
    details: any;
}) {
    return await prisma.approvalRequest.create({
        data: {
            entityType: data.entityType,
            entityId: data.entityId,
            requestedById: data.requestedById,
            requestedByName: data.requestedByName,
            details: data.details,
            status: 'PENDING',
            currentLevel: 1
        }
    });
}

export async function processApprovalAction(data: {
    requestId: string;
    approverId: string;
    approverName: string;
    action: 'APPROVED' | 'REJECTED' | 'REVISION' | 'DELEGATED' | 'ESCALATED';
    comment?: string;
    signature?: string;
}) {
    const request = await prisma.approvalRequest.findUnique({
        where: { id: data.requestId },
        include: { logs: true }
    });

    if (!request) throw new Error('Approval request not found');

    // Add log
    await prisma.approvalLog.create({
        data: {
            requestId: data.requestId,
            approverId: data.approverId,
            approverName: data.approverName,
            action: data.action,
            comment: data.comment,
            signature: data.signature
        }
    });

    let newStatus = request.status;
    if (data.action === 'APPROVED') {
        // For simple 1-level approval in this iteration
        newStatus = 'APPROVED';
    } else if (data.action === 'REJECTED') {
        newStatus = 'REJECTED';
    } else if (data.action === 'REVISION') {
        newStatus = 'REVISION_REQUESTED';
    }

    const updatedRequest = await prisma.approvalRequest.update({
        where: { id: data.requestId },
        data: { status: newStatus }
    });

    // If approved, trigger entity status update or financial posting
    if (newStatus === 'APPROVED') {
        await handleEntityApproval(request.entityType, request.entityId);
    }

    return updatedRequest;
}

async function handleEntityApproval(type: string, id: string) {
    switch (type) {
        case 'PURCHASE_ORDER':
            await prisma.purchaseOrder.update({
                where: { id },
                data: { status: 'APPROVED' }
            });
            // Here we would also trigger Finance posting if needed
            break;
        case 'FEE_AGREEMENT':
            await prisma.creditAgreement.update({
                where: { id },
                data: { status: 'ACTIVE' }
            });
            break;
        case 'PAYROLL':
            await prisma.payrollEntry.updateMany({
                where: { status: 'Pending Approval' }, // Logic would be more specific per run
                data: { status: 'Approved' }
            });
            break;
        // Add other cases
    }
}
