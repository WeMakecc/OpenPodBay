module.exports = {

    UserSchema : {
        user_id: Number,
        username: String,
        group: Number,
        status: Number,
        credits: String,
        active: Number
    },
    
    TagSchema : {
        tag_id: Number,
        user_id: Number,
        type: String,
        value: String,
        active: Number
    },

    NodeSchema : {
        node_id: Number,
        current_ip: String,
        date_last_seen: Number,
        status: Number,
        active: Number,
        type: String,
        label:String
    },

    ReservationSchema : {
        reservation_id: Number,
        user_id: Number,
        node_id: Number,
        expected_start: Number,
        actual_start: Number,
        expected_duration: Number,
        actual_duration: Number,
        active: Number
    },

    GroupSchema : {
        group_id: Number,
        description: String
    },

    CalendarSchema : {
        calendar_id: Number,
        group_id: Number,
        node_id: Number,
        day: String,
        start: String,
        end: String,
        active: Number
    }

}