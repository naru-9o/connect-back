import { validationResult } from 'express-validator';
import Event from '../models/Event.js';
import {cloudinary} from '../utils/cloudinary.js';
import fs from 'fs';

// @desc    Get all events
export const getEvents = async (req, res) => {
  try {
    const { search, tags, page = 1, limit = 20 } = req.query;

    const query = {
      isActive: true,
      date: { $gte: new Date() }
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name startupName profileImage')
      .populate('attendees', 'name startupName profileImage')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name startupName profileImage')
      .populate('attendees', 'name startupName profileImage');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, event });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new event
export const createEvent = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const {
      title,
      description,
      date,
      time,
      location,
      maxAttendees,
      tags
    } = req.body;

    // Normalize tags from FormData
    const parsedTags = typeof tags === 'string'
      ? [tags]
      : Array.isArray(tags)
      ? tags
      : [];

    const sanitizedTags = parsedTags.map(tag => String(tag).trim());

    let imageUrl = '';
    let imageId = '';

    // CloudinaryStorage automatically uploads the file
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
      imageId = req.file.filename; // Cloudinary public_id
    }

    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      maxAttendees,
      tags: sanitizedTags,
      image: imageUrl,
      imagePublicId: imageId,
      organizer: req.user._id
    });

    await newEvent.save();

    res.status(201).json({ success: true, event: newEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};





// @desc    Update event
export const updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find event by ID
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    // If a new image was uploaded, update it
    if (req.file) {
      // Delete the old image from Cloudinary
      if (event.imagePublicId) {
        await cloudinary.uploader.destroy(event.imagePublicId);
      }

      // Use new uploaded image from multer-storage-cloudinary
      req.body.image = req.file.path; // Cloudinary URL
      req.body.imagePublicId = req.file.filename; // Cloudinary public_id
    }

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('organizer', 'name startupName profileImage')
      .populate('attendees', 'name startupName profileImage');

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// @desc    RSVP to event
export const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const userId = req.user.id;
    const isAttending = event.attendees.includes(userId);

    if (isAttending) {
      event.attendees = event.attendees.filter(id => id.toString() !== userId);
    } else {
      if (event.attendees.length >= event.maxAttendees) {
        return res.status(400).json({ success: false, message: 'Event is full' });
      }
      event.attendees.push(userId);
    }

    await event.save();
    await event.populate('organizer', 'name startupName profileImage');
    await event.populate('attendees', 'name startupName profileImage');

    res.json({
      success: true,
      message: isAttending ? 'RSVP cancelled' : 'RSVP confirmed',
      event
    });
  } catch (error) {
    console.error('RSVP event error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    // Delete event image from Cloudinary
    if (event.bannerImage?.public_id) {
      await cloudinary.uploader.destroy(event.bannerImage.public_id);
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
