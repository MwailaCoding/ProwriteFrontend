#!/usr/bin/env python3
"""
Francisca Template Analyzer
Analyzes the Francisca template and preserves exact styling while making content dynamic
"""

import json
from typing import Dict, List, Any

class FranciscaTemplateAnalyzer:
    """Analyze Francisca template to preserve styling and make content dynamic"""
    
    def __init__(self):
        self.template_name = "Francisca Professional Resume"
        self.style_preserved = True
    
    def analyze_francisca_template(self) -> Dict:
        """Analyze the Francisca template and generate form schema with preserved styling"""
        
        # Based on the uploaded template analysis
        form_schema = {
            'version': '1.0',
            'template_name': self.template_name,
            'style_preserved': self.style_preserved,
            'template_styling': {
                'header': {
                    'name': {
                        'font': 'Arial-Bold',
                        'size': 18,
                        'color': (0, 0, 0),
                        'alignment': 'center',
                        'bold': True,
                        'position': {'x': 50, 'y': 50, 'width': 500, 'height': 30}
                    },
                    'contact': {
                        'font': 'Arial',
                        'size': 12,
                        'color': (0, 0, 0),
                        'alignment': 'center',
                        'position': {'x': 50, 'y': 90, 'width': 500, 'height': 20}
                    }
                },
                'section_headers': {
                    'font': 'Arial-Bold',
                    'size': 14,
                    'color': (0, 0, 0),
                    'alignment': 'left',
                    'bold': True,
                    'uppercase': True,
                    'underlined': True
                },
                'institution_names': {
                    'font': 'Arial-Bold',
                    'size': 12,
                    'color': (0, 0, 0),
                    'alignment': 'left',
                    'bold': True
                },
                'roles_degrees': {
                    'font': 'Arial-Italic',
                    'size': 11,
                    'color': (0, 0, 0),
                    'alignment': 'left',
                    'italic': True
                },
                'locations': {
                    'font': 'Arial',
                    'size': 11,
                    'color': (0, 0, 0),
                    'alignment': 'left'
                },
                'dates': {
                    'font': 'Arial',
                    'size': 11,
                    'color': (0, 0, 0),
                    'alignment': 'right'
                },
                'bullet_points': {
                    'font': 'Arial',
                    'size': 11,
                    'color': (0, 0, 0),
                    'alignment': 'left',
                    'bullet_style': 'solid_circle'
                }
            },
            'fields': [
                {
                    'id': 'field_1',
                    'name': 'fullName',
                    'label': 'Full Name',
                    'type': 'text',
                    'required': True,
                    'section': 'header',
                    'styling': {
                        'font': 'Arial-Bold',
                        'size': 18,
                        'color': (0, 0, 0),
                        'alignment': 'center',
                        'bold': True,
                        'position': {'x': 50, 'y': 50, 'width': 500, 'height': 30}
                    },
                    'validation': {'minLength': 1, 'maxLength': 100},
                    'placeholder': 'Enter your full name'
                },
                {
                    'id': 'field_2',
                    'name': 'email',
                    'label': 'Email Address',
                    'type': 'email',
                    'required': True,
                    'section': 'header',
                    'styling': {
                        'font': 'Arial',
                        'size': 12,
                        'color': (0, 0, 0),
                        'alignment': 'center',
                        'position': {'x': 50, 'y': 90, 'width': 500, 'height': 20}
                    },
                    'validation': {'pattern': r'^[^\s@]+@[^\s@]+\.[^\s@]+$'},
                    'placeholder': 'Enter your email address'
                },
                {
                    'id': 'field_3',
                    'name': 'phone',
                    'label': 'Phone Number',
                    'type': 'tel',
                    'required': True,
                    'section': 'header',
                    'styling': {
                        'font': 'Arial',
                        'size': 12,
                        'color': (0, 0, 0),
                        'alignment': 'center',
                        'position': {'x': 50, 'y': 120, 'width': 500, 'height': 20}
                    },
                    'validation': {'pattern': r'^[\+]?[1-9][\d]{0,15}$'},
                    'placeholder': 'Enter your phone number'
                },
                {
                    'id': 'field_4',
                    'name': 'education',
                    'label': 'Education',
                    'type': 'array',
                    'required': True,
                    'section': 'education',
                    'styling': {
                        'font': 'Arial',
                        'size': 11,
                        'color': (0, 0, 0),
                        'alignment': 'left'
                    },
                    'itemSchema': {
                        'institution': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial-Bold', 'size': 12, 'bold': True}
                        },
                        'degree': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial-Italic', 'size': 11, 'italic': True}
                        },
                        'location': {
                            'type': 'text', 
                            'required': False,
                            'styling': {'font': 'Arial', 'size': 11}
                        },
                        'graduationDate': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial', 'size': 11, 'alignment': 'right'}
                        },
                        'coursework': {
                            'type': 'textarea', 
                            'required': False,
                            'styling': {'font': 'Arial', 'size': 11, 'bullet_style': 'solid_circle'}
                        },
                        'activities': {
                            'type': 'textarea', 
                            'required': False,
                            'styling': {'font': 'Arial', 'size': 11, 'bullet_style': 'solid_circle'}
                        }
                    }
                },
                {
                    'id': 'field_5',
                    'name': 'experience',
                    'label': 'Professional Experience',
                    'type': 'array',
                    'required': True,
                    'section': 'experience',
                    'styling': {
                        'font': 'Arial',
                        'size': 11,
                        'color': (0, 0, 0),
                        'alignment': 'left'
                    },
                    'itemSchema': {
                        'company': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial-Bold', 'size': 12, 'bold': True}
                        },
                        'position': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial-Italic', 'size': 11, 'italic': True}
                        },
                        'location': {
                            'type': 'text', 
                            'required': False,
                            'styling': {'font': 'Arial', 'size': 11}
                        },
                        'startDate': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial', 'size': 11, 'alignment': 'right'}
                        },
                        'endDate': {
                            'type': 'text', 
                            'required': False,
                            'styling': {'font': 'Arial', 'size': 11, 'alignment': 'right'}
                        },
                        'current': {
                            'type': 'boolean', 
                            'default': False
                        },
                        'responsibilities': {
                            'type': 'textarea', 
                            'required': True,
                            'styling': {'font': 'Arial', 'size': 11, 'bullet_style': 'solid_circle'}
                        }
                    }
                },
                {
                    'id': 'field_6',
                    'name': 'leadership',
                    'label': 'Leadership/Organizations',
                    'type': 'array',
                    'required': False,
                    'section': 'leadership',
                    'styling': {
                        'font': 'Arial',
                        'size': 11,
                        'color': (0, 0, 0),
                        'alignment': 'left'
                    },
                    'itemSchema': {
                        'organization': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial-Bold', 'size': 12, 'bold': True}
                        },
                        'role': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial-Italic', 'size': 11, 'italic': True}
                        },
                        'location': {
                            'type': 'text', 
                            'required': False,
                            'styling': {'font': 'Arial', 'size': 11}
                        },
                        'startDate': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial', 'size': 11, 'alignment': 'right'}
                        },
                        'endDate': {
                            'type': 'text', 
                            'required': False,
                            'styling': {'font': 'Arial', 'size': 11, 'alignment': 'right'}
                        },
                        'achievements': {
                            'type': 'textarea', 
                            'required': True,
                            'styling': {'font': 'Arial', 'size': 11, 'bullet_style': 'solid_circle'}
                        }
                    }
                },
                {
                    'id': 'field_7',
                    'name': 'volunteer',
                    'label': 'Volunteer Work',
                    'type': 'array',
                    'required': False,
                    'section': 'volunteer',
                    'styling': {
                        'font': 'Arial',
                        'size': 11,
                        'color': (0, 0, 0),
                        'alignment': 'left'
                    },
                    'itemSchema': {
                        'organization': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial-Bold', 'size': 12, 'bold': True}
                        },
                        'role': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial-Italic', 'size': 11, 'italic': True}
                        },
                        'location': {
                            'type': 'text', 
                            'required': False,
                            'styling': {'font': 'Arial', 'size': 11}
                        },
                        'startDate': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial', 'size': 11, 'alignment': 'right'}
                        },
                        'endDate': {
                            'type': 'text', 
                            'required': False,
                            'styling': {'font': 'Arial', 'size': 11, 'alignment': 'right'}
                        },
                        'responsibilities': {
                            'type': 'textarea', 
                            'required': True,
                            'styling': {'font': 'Arial', 'size': 11, 'bullet_style': 'solid_circle'}
                        }
                    }
                },
                {
                    'id': 'field_8',
                    'name': 'skills',
                    'label': 'Skills & Interests',
                    'type': 'array',
                    'required': False,
                    'section': 'skills',
                    'styling': {
                        'font': 'Arial',
                        'size': 11,
                        'color': (0, 0, 0),
                        'alignment': 'left'
                    },
                    'itemSchema': {
                        'name': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial', 'size': 11}
                        },
                        'category': {
                            'type': 'select', 
                            'options': ['Language', 'Skills', 'Interests', 'Programs'],
                            'styling': {'font': 'Arial', 'size': 11}
                        }
                    }
                },
                {
                    'id': 'field_9',
                    'name': 'referees',
                    'label': 'Referees',
                    'type': 'array',
                    'required': False,
                    'section': 'referees',
                    'styling': {
                        'font': 'Arial',
                        'size': 11,
                        'color': (0, 0, 0),
                        'alignment': 'left'
                    },
                    'itemSchema': {
                        'name': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial-Bold', 'size': 11, 'bold': True}
                        },
                        'position': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial', 'size': 11}
                        },
                        'organization': {
                            'type': 'text', 
                            'required': True,
                            'styling': {'font': 'Arial', 'size': 11}
                        },
                        'phone': {
                            'type': 'tel', 
                            'required': True,
                            'styling': {'font': 'Arial', 'size': 11}
                        },
                        'email': {
                            'type': 'email', 
                            'required': True,
                            'styling': {'font': 'Arial', 'size': 11, 'color': (0, 0, 255), 'underlined': True}
                        }
                    }
                }
            ],
            'sections': [
                {
                    'id': 'header',
                    'title': 'Personal Information',
                    'order': 1,
                    'description': 'Your name and contact information',
                    'styling': {
                        'font': 'Arial-Bold',
                        'size': 18,
                        'alignment': 'center',
                        'bold': True
                    }
                },
                {
                    'id': 'education',
                    'title': 'EDUCATION',
                    'order': 2,
                    'description': 'Your academic background and qualifications',
                    'styling': {
                        'font': 'Arial-Bold',
                        'size': 14,
                        'alignment': 'left',
                        'bold': True,
                        'uppercase': True,
                        'underlined': True
                    }
                },
                {
                    'id': 'experience',
                    'title': 'PROFESSIONAL EXPERIENCE',
                    'order': 3,
                    'description': 'Your work history and achievements',
                    'styling': {
                        'font': 'Arial-Bold',
                        'size': 14,
                        'alignment': 'left',
                        'bold': True,
                        'uppercase': True,
                        'underlined': True
                    }
                },
                {
                    'id': 'leadership',
                    'title': 'LEADERSHIP/ORGANIZATIONS',
                    'order': 4,
                    'description': 'Your leadership roles and organizational involvement',
                    'styling': {
                        'font': 'Arial-Bold',
                        'size': 14,
                        'alignment': 'left',
                        'bold': True,
                        'uppercase': True,
                        'underlined': True
                    }
                },
                {
                    'id': 'volunteer',
                    'title': 'VOLUNTEER WORK',
                    'order': 5,
                    'description': 'Your volunteer experience and community service',
                    'styling': {
                        'font': 'Arial-Bold',
                        'size': 14,
                        'alignment': 'left',
                        'bold': True,
                        'uppercase': True,
                        'underlined': True
                    }
                },
                {
                    'id': 'skills',
                    'title': 'SKILLS & INTERESTS',
                    'order': 6,
                    'description': 'Your skills, languages, and interests',
                    'styling': {
                        'font': 'Arial-Bold',
                        'size': 14,
                        'alignment': 'left',
                        'bold': True,
                        'uppercase': True,
                        'underlined': True
                    }
                },
                {
                    'id': 'referees',
                    'title': 'REFEREES',
                    'order': 7,
                    'description': 'Professional references',
                    'styling': {
                        'font': 'Arial-Bold',
                        'size': 14,
                        'alignment': 'left',
                        'bold': True,
                        'uppercase': True,
                        'underlined': True
                    }
                }
            ],
            'metadata': {
                'total_fields': 9,
                'required_fields': 4,
                'template_type': 'professional_resume',
                'style_preserved': True,
                'layout': 'single_column',
                'font_family': 'Arial',
                'color_scheme': 'black_on_white'
            }
        }
        
        return form_schema
    
    def get_template_preview(self) -> Dict:
        """Get a preview of how the template will look with preserved styling"""
        return {
            'template_name': self.template_name,
            'style_preserved': True,
            'layout_preview': {
                'header': {
                    'name': 'Centered, 18pt, Bold',
                    'contact': 'Centered, 12pt, Regular'
                },
                'sections': {
                    'headers': 'Left-aligned, 14pt, Bold, Uppercase, Underlined',
                    'institutions': 'Left-aligned, 12pt, Bold',
                    'roles': 'Left-aligned, 11pt, Italic',
                    'locations': 'Left-aligned, 11pt, Regular',
                    'dates': 'Right-aligned, 11pt, Regular',
                    'bullet_points': 'Left-aligned, 11pt, Regular, Solid Circle Bullets'
                }
            },
            'content_structure': {
                'personal_info': ['Full Name', 'Email', 'Phone'],
                'education': ['Institution', 'Degree', 'Location', 'Graduation Date', 'Coursework', 'Activities'],
                'experience': ['Company', 'Position', 'Location', 'Dates', 'Responsibilities'],
                'leadership': ['Organization', 'Role', 'Location', 'Dates', 'Achievements'],
                'volunteer': ['Organization', 'Role', 'Location', 'Dates', 'Responsibilities'],
                'skills': ['Languages', 'Skills', 'Interests', 'Programs'],
                'referees': ['Name', 'Position', 'Organization', 'Phone', 'Email']
            }
        }

# Create global instance
francisca_analyzer = FranciscaTemplateAnalyzer()

























