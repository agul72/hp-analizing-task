function saveInvitation(err, createdUser) {
    Shop.findById(shopId).exec(function(err, shop) {
        if (err || !shop) {
            return res.status(500).send(err || { message: 'No shop found' });
        }
        if (shop.invitations.indexOf(invitationResponse.body.invitationId)) {
            shop.invitations.push(invitationResponse.body.invitationId);
        }
        if (shop.users.indexOf(createdUser._id) === -1) {
            shop.users.push(createdUser);
        }
        shop.save();
    });
}

function invResponse(err, invitationResponse) {
    if (invitationResponse.status === 201) {
        User.findOneAndUpdate({
            authId: invitationResponse.body.authId
        }, {
            authId: invitationResponse.body.authId,
            email: invitationBody.email
        }, {
            upsert: true,
            new: true
        }, saveInvitation(err, createdUser));
    } else if (invitationResponse.status === 200) {
        res.status(400).json({
            error: true,
            message: 'User already invited to this shop'
        });
        return;
    }
    res.json(invitationResponse);
}

exports.inviteUser = (req, res) => {
    const invitationBody = req.body;
    const shopId = req.params.shopId;
    const authUrl = "https://url.to.auth.system.com/invitation";
    superagent
        .post(authUrl)
        .send(invitationBody)
        .end((err, invitationResponse) => invResponse(err, invitationResponse))
        .cache(e => console.log(e.message));
};
