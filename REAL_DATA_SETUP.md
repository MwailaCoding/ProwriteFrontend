# Real Data Setup Guide

## Overview
The dashboard has been updated to use **real data only** instead of mock data. This means you need to configure actual API keys for the services to work.

## Required API Keys

### 1. AI Services (Required for Dashboard)
```bash
# Single AI API Key (for all AI operations)
VITE_AI_API_KEY=sk-your_ai_api_key_here
```

### 2. Market Data Services (Required for Market Intelligence)
```bash
# LinkedIn API Key
VITE_LINKEDIN_API_KEY=your_linkedin_api_key_here

# Indeed API Key
VITE_INDEED_API_KEY=your_indeed_api_key_here

# Glassdoor API Key
VITE_GLASSDOOR_API_KEY=your_glassdoor_api_key_here

# Bureau of Labor Statistics API Key
VITE_BLS_API_KEY=your_bls_api_key_here

# Company Data API Key
VITE_COMPANY_API_KEY=your_company_api_key_here
```

## Setup Instructions

### Step 1: Create Environment File
Create a `.env` file in the `frontend` directory:

```bash
cd frontend
touch .env
```

### Step 2: Add API Keys
Add your API keys to the `.env` file:

```env
# AI Services - Single key for all AI operations
VITE_AI_API_KEY=sk-your_ai_api_key_here

# Market Data Services
VITE_LINKEDIN_API_KEY=your_linkedin_api_key_here
VITE_INDEED_API_KEY=your_indeed_api_key_here
VITE_GLASSDOOR_API_KEY=your_glassdoor_api_key_here
VITE_BLS_API_KEY=your_bls_api_key_here
VITE_COMPANY_API_KEY=your_company_api_key_here
```

### Step 3: Restart Development Server
```bash
npm run dev
```

## API Key Sources

### AI Services
- **OpenAI**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) (Single key for all AI operations)

### Market Data Services
- **LinkedIn**: [https://developer.linkedin.com/](https://developer.linkedin.com/) (Requires approval)
- **Indeed**: [https://developer.indeed.com/](https://developer.indeed.com/)
- **Glassdoor**: [https://www.glassdoor.com/developer/](https://www.glassdoor.com/developer/)
- **BLS**: [https://www.bls.gov/developers/](https://www.bls.gov/developers/)
- **Company Data**: Various providers (Clearbit, Company House, etc.)

## What Happens Without API Keys

### With API Keys ✅
- **AI Career Insights**: Real AI-generated career analysis
- **Market Intelligence**: Live job market data and trends
- **Career Roadmap**: AI-powered career planning
- **Salary Intelligence**: Real-time compensation data
- **Skill Analysis**: Market-driven skill recommendations

### Without API Keys ❌
- **AI Career Insights**: Error message asking to configure API keys
- **Market Intelligence**: Service unavailable errors
- **Career Roadmap**: Basic structure with no real data
- **Dashboard**: Limited functionality with error states

## Error Handling

The dashboard now shows helpful error messages when services are unavailable:

1. **API Key Missing**: "Please configure your AI API keys to get personalized insights"
2. **Service Unavailable**: "Unable to fetch AI insights. Please check your configuration"
3. **API Errors**: Specific error messages for each service

## Testing Real Data

### 1. Check Console Logs
Open browser DevTools and check for:
- API call success/failure messages
- Real data responses
- Error messages

### 2. Verify Data Sources
- **AI Insights**: Should show "AI-Generated Insight" instead of mock data
- **Market Data**: Should show "Real-time API Data" as source
- **Career Path**: Should show real market trends and AI analysis

### 3. Monitor Network Requests
Check Network tab in DevTools for:
- Successful API calls to OpenAI/Anthropic
- Market data API requests
- Response data structure

## Troubleshooting

### Common Issues

1. **"No AI API keys configured"**
   - Check `.env` file exists in `frontend` directory
   - Verify API key format (no quotes, no spaces)
   - Restart development server

2. **"API service temporarily unavailable"**
   - Check API key validity
   - Verify service status
   - Check rate limits

3. **"Failed to fetch market trends"**
   - Verify market data API keys
   - Check API quotas and limits
   - Ensure proper API permissions

### Debug Steps

1. **Verify Environment Variables**
   ```bash
   # Check if variables are loaded
   console.log(import.meta.env.VITE_OPENAI_API_KEY)
   ```

2. **Test API Keys Individually**
   - Test OpenAI API key separately
   - Test market data APIs one by one

3. **Check API Documentation**
   - Verify API endpoints are correct
   - Check authentication requirements
   - Review rate limiting policies

## Security Notes

- **Never commit `.env` files** to version control
- **Use environment-specific keys** for development/production
- **Rotate API keys** regularly
- **Monitor API usage** to prevent unexpected charges

## Next Steps

1. **Get API Keys** from the services you want to use
2. **Configure Environment** with your keys
3. **Test Dashboard** functionality
4. **Monitor Performance** and API usage
5. **Scale Up** by adding more data sources

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify API key configuration
3. Test API keys independently
4. Review service documentation
5. Check rate limits and quotas

The dashboard is now configured to use **real data only** and will provide meaningful error messages when services are unavailable.

