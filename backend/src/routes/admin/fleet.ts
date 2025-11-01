import express, { Request, Response, Router } from 'express';
import { prisma } from '../../config/database';
import { authenticate, AuthRequest } from '../../middleware/auth';

const router: Router = express.Router();

// All fleet routes require authentication
router.use(authenticate);

// ============================================================================
// BUSES ENDPOINTS
// ============================================================================

// GET /api/admin/fleet/buses - List all buses
router.get('/buses', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buses = await prisma.bus.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      count: buses.length,
      data: buses
    });
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buses'
    });
  }
});

// GET /api/admin/fleet/buses/:id - Get single bus
router.get('/buses/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const bus = await prisma.bus.findUnique({
      where: { id: parseInt(id) }
    });

    if (!bus) {
      res.status(404).json({
        success: false,
        error: 'Bus not found'
      });
      return;
    }

    res.json({
      success: true,
      data: bus
    });
  } catch (error) {
    console.error('Error fetching bus:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bus'
    });
  }
});

// POST /api/admin/fleet/buses - Create new bus
router.post('/buses', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      licensePlate,
      capacity,
      bikeCapacity,
      availabilityType,
      availabilityRules,
      bookingCutoffHours,
      active,
      notes
    } = req.body;

    // Validation
    if (!name || !licensePlate || !capacity || !bikeCapacity) {
      res.status(400).json({
        success: false,
        error: 'Name, license plate, capacity, and bike capacity are required'
      });
      return;
    }

    // Check if license plate already exists
    const existing = await prisma.bus.findUnique({
      where: { licensePlate }
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: 'A bus with this license plate already exists'
      });
      return;
    }

    const bus = await prisma.bus.create({
      data: {
        name,
        licensePlate,
        capacity,
        bikeCapacity,
        availabilityType: availabilityType || 'always',
        availabilityRules: availabilityRules || {},
        bookingCutoffHours: bookingCutoffHours || 18,
        active: active !== undefined ? active : true,
        notes: notes || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: bus
    });
  } catch (error) {
    console.error('Error creating bus:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bus'
    });
  }
});

// PUT /api/admin/fleet/buses/:id - Update bus
router.put('/buses/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      licensePlate,
      capacity,
      bikeCapacity,
      availabilityType,
      availabilityRules,
      bookingCutoffHours,
      active,
      notes
    } = req.body;

    // Check if bus exists
    const existing = await prisma.bus.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Bus not found'
      });
      return;
    }

    // If license plate is being changed, check it's not taken
    if (licensePlate && licensePlate !== existing.licensePlate) {
      const duplicate = await prisma.bus.findUnique({
        where: { licensePlate }
      });

      if (duplicate) {
        res.status(409).json({
          success: false,
          error: 'A bus with this license plate already exists'
        });
        return;
      }
    }

    const bus = await prisma.bus.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(licensePlate && { licensePlate }),
        ...(capacity && { capacity }),
        ...(bikeCapacity && { bikeCapacity }),
        ...(availabilityType && { availabilityType }),
        ...(availabilityRules !== undefined && { availabilityRules }),
        ...(bookingCutoffHours !== undefined && { bookingCutoffHours }),
        ...(active !== undefined && { active }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Bus updated successfully',
      data: bus
    });
  } catch (error) {
    console.error('Error updating bus:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update bus'
    });
  }
});

// DELETE /api/admin/fleet/buses/:id - Delete bus
router.delete('/buses/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if bus exists
    const existing = await prisma.bus.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Bus not found'
      });
      return;
    }

    // Check if bus is used in any scheduled services
    const servicesCount = await prisma.scheduledService.count({
      where: { busId: parseInt(id) }
    });

    if (servicesCount > 0) {
      res.status(409).json({
        success: false,
        error: `Cannot delete bus. It is used in ${servicesCount} scheduled service(s). Set it to inactive instead.`
      });
      return;
    }

    await prisma.bus.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bus:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete bus'
    });
  }
});

// ============================================================================
// ROUTES ENDPOINTS
// ============================================================================

// GET /api/admin/fleet/routes - List all routes
router.get('/routes', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { locationType } = req.query;

    const where = locationType 
      ? { locationType: locationType as string }
      : {};

    const routes = await prisma.route.findMany({
      where,
      orderBy: { displayOrder: 'asc' }
    });

    res.json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch routes'
    });
  }
});

// GET /api/admin/fleet/routes/:id - Get single route
router.get('/routes/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const route = await prisma.route.findUnique({
      where: { id: parseInt(id) }
    });

    if (!route) {
      res.status(404).json({
        success: false,
        error: 'Route not found'
      });
      return;
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch route'
    });
  }
});

// POST /api/admin/fleet/routes - Create new route
router.post('/routes', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      nameEn,
      nameDe,
      nameEs,
      nameIt,
      nameFr,
      nameCa,
      nameNl,
      nameSv,
      nameNb,
      nameDa,
      locationType,
      coordinates,
      displayOrder,
      active
    } = req.body;

    // Validation
    if (!nameEn || !locationType) {
      res.status(400).json({
        success: false,
        error: 'English name and location type are required'
      });
      return;
    }

    if (!['pickup', 'dropoff', 'both'].includes(locationType)) {
      res.status(400).json({
        success: false,
        error: 'Location type must be: pickup, dropoff, or both'
      });
      return;
    }

    const route = await prisma.route.create({
      data: {
        nameEn,
        nameDe,
        nameEs,
        nameIt,
        nameFr,
        nameCa,
        nameNl,
        nameSv,
        nameNb,
        nameDa,
        locationType,
        coordinates: coordinates || {},
        displayOrder: displayOrder || 0,
        active: active !== undefined ? active : true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route
    });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create route'
    });
  }
});

// PUT /api/admin/fleet/routes/:id - Update route
router.put('/routes/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    // Only include fields that are provided
    const fields = [
      'nameEn', 'nameDe', 'nameEs', 'nameIt', 'nameFr',
      'nameCa', 'nameNl', 'nameSv', 'nameNb', 'nameDa',
      'locationType', 'coordinates', 'displayOrder', 'active'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Validate location type if provided
    if (updateData.locationType && !['pickup', 'dropoff', 'both'].includes(updateData.locationType)) {
      res.status(400).json({
        success: false,
        error: 'Location type must be: pickup, dropoff, or both'
      });
      return;
    }

    const route = await prisma.route.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Route updated successfully',
      data: route
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Route not found'
      });
      return;
    }
    
    console.error('Error updating route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update route'
    });
  }
});

// DELETE /api/admin/fleet/routes/:id - Delete route
router.delete('/routes/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if route is used in any services
    const servicesCount = await prisma.scheduledService.count({
      where: {
        OR: [
          { routePickup1Id: parseInt(id) },
          { routePickup2Id: parseInt(id) },
          { routeDropoffId: parseInt(id) }
        ]
      }
    });

    if (servicesCount > 0) {
      res.status(409).json({
        success: false,
        error: `Cannot delete route. It is used in ${servicesCount} scheduled service(s). Set it to inactive instead.`
      });
      return;
    }

    await prisma.route.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Route not found'
      });
      return;
    }

    console.error('Error deleting route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete route'
    });
  }
});

export default router;
