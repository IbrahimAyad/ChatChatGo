import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface MenuVariables {
  restaurant_name: string;
  phone_number: string;
  business_hours: string;
  current_revenue: string;
  revenue_change: string;
  wait_time: string;
  peak_hour: string;
  current_special: string;
  social_trending_item: string;
  social_sentiment: string;
  weather_impact: string;
  top_selling_item: string;
  total_orders_today: string;
  average_order_value: string;
  last_updated: string;
  menu_version: string;
}

// Default values for Royale with Cheese
const defaultVariables: MenuVariables = {
  restaurant_name: "Royale with Cheese",
  phone_number: "(555) 123-ROYALE",
  business_hours: "Mon-Thu 11AM-10PM, Fri-Sat 11AM-11PM, Sun 12PM-9PM",
  current_revenue: "2847",
  revenue_change: "+18%",
  wait_time: "8 minutes",
  peak_hour: "7:15 PM",
  current_special: "Mia Wallace Monday - 25% off BBQ Burger",
  social_trending_item: "Nacho Cheese Ravioli",
  social_sentiment: "92%",
  weather_impact: "Sunny weather increased outdoor seating by 45%",
  top_selling_item: "Mia Wallace BBQ Burger",
  total_orders_today: "89",
  average_order_value: "31.97",
  last_updated: new Date().toISOString(),
  menu_version: "1.0"
};

function replaceVariables(content: string, variables: MenuVariables): string {
  let result = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

// GET - Return processed menu with current variables
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'html'; // html, txt, or json
    
    let menuPath: string;
    let contentType: string;
    
    if (format === 'txt') {
      menuPath = path.join(process.cwd(), 'royale-menu.txt');
      contentType = 'text/plain';
    } else if (format === 'json') {
      menuPath = path.join(process.cwd(), 'royale-with-cheese-menu.json');
      contentType = 'application/json';
    } else {
      menuPath = path.join(process.cwd(), 'royale-with-cheese-menu.html');
      contentType = 'text/html';
    }
    
    if (!fs.existsSync(menuPath)) {
      return NextResponse.json({ error: `Menu file not found: ${format}` }, { status: 404 });
    }
    
    const menuContent = fs.readFileSync(menuPath, 'utf8');
    
    if (format === 'json') {
      // For JSON, return as-is (already has the data)
      return new NextResponse(menuContent, {
        headers: { 'Content-Type': contentType }
      });
    }
    
    // For HTML/TXT, replace variables
    const processedContent = replaceVariables(menuContent, defaultVariables);
    
    return new NextResponse(processedContent, {
      headers: { 'Content-Type': contentType }
    });
    
  } catch (error) {
    console.error('Error processing menu:', error);
    return NextResponse.json({ error: 'Failed to process menu' }, { status: 500 });
  }
}

// POST - Update variables and regenerate menu
export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    
    // Merge with default variables
    const updatedVariables: MenuVariables = {
      ...defaultVariables,
      ...updates,
      last_updated: new Date().toISOString()
    };
    
    // Save updated variables
    const variablesPath = path.join(process.cwd(), 'menu-variables.json');
    fs.writeFileSync(variablesPath, JSON.stringify(updatedVariables, null, 2));
    
    // Return processed menu with new variables
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'html';
    
    let menuPath: string;
    if (format === 'txt') {
      menuPath = path.join(process.cwd(), 'royale-menu.txt');
    } else {
      menuPath = path.join(process.cwd(), 'royale-with-cheese-menu.html');
    }
    
    if (fs.existsSync(menuPath)) {
      const menuContent = fs.readFileSync(menuPath, 'utf8');
      const processedContent = replaceVariables(menuContent, updatedVariables);
      
      return NextResponse.json({
        success: true,
        message: 'Variables updated successfully',
        variables: updatedVariables,
        processed_content: processedContent
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Variables updated successfully',
      variables: updatedVariables
    });
    
  } catch (error) {
    console.error('Error updating variables:', error);
    return NextResponse.json({ error: 'Failed to update variables' }, { status: 500 });
  }
}

// PUT - Get current variables
export async function PUT() {
  try {
    const variablesPath = path.join(process.cwd(), 'menu-variables.json');
    
    let variables = defaultVariables;
    if (fs.existsSync(variablesPath)) {
      variables = JSON.parse(fs.readFileSync(variablesPath, 'utf8'));
    }
    
    return NextResponse.json(variables);
    
  } catch (error) {
    console.error('Error reading variables:', error);
    return NextResponse.json({ error: 'Failed to read variables' }, { status: 500 });
  }
} 